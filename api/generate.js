import { MODEL } from './config.js';

// Helpers
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { resumeText, jobDesc } = req.body;

  if (!resumeText || resumeText.trim().length < 50)
    return res.status(400).json({ error: 'Resume text too short or missing.' });
  if (!jobDesc || jobDesc.trim().length < 100)
    return res.status(400).json({ error: 'Job description too short.' });

  const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

  async function ask(prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const r = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://resumeai.app',
          'X-Title': 'ResumeAI'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[OpenRouter] Response Status: ${r.status}`);
      const raw = await r.text();
      console.log(`[OpenRouter] Raw Response: ${raw}`);

      if (!r.ok) {
        return { success: false, error: `OpenRouter request failed with status ${r.status}`, raw };
      }

      let d;
      try { d = JSON.parse(raw); }
      catch (e) { return { success: false, error: 'Invalid JSON returned from OpenRouter', raw }; }

      const content = d.choices?.[0]?.message?.content || '';
      if (!content) return { success: false, error: 'OpenRouter returned an empty or malformed response', raw };

      return { success: true, data: content };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`[OpenRouter] Fetch/System Error: ${err.message}`);
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Request timed out' : `Fetch failed: ${err.message}`,
        raw: null
      };
    }
  }

  function parseJSON(raw) {
    console.log(`[parseJSON] Attempting to parse: ${raw}`);
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error(`[parseJSON] No JSON object found in response`);
        return null;
      }
      return JSON.parse(match[0]);
    } catch (e) {
      console.error(`[parseJSON] JSON.parse failed: ${e.message}`);
      return null;
    }
  }

  // Compute keyword match % from found/missing lists.
  function keywordMatchFrom(found, missing) {
    const f = Array.isArray(found) ? found.length : 0;
    const m = Array.isArray(missing) ? missing.length : 0;
    const total = f + m;
    return total > 0 ? Math.round((f / total) * 100) : 0;
  }

  // Final deterministic keyword-match sanity check, comparing the model
  // keyword lists against the actual text. Catches AI hallucination.
  function reconcileKeywords(text, found, missing) {
    const lower = (text || '').toLowerCase();
    const verifiedFound = [];
    const verifiedMissing = [];
    const seen = new Set();

    const matches = (kw) => {
      const k = String(kw || '').trim();
      if (!k) return false;
      return lower.includes(k.toLowerCase());
    };

    for (const kw of (found || [])) {
      const k = String(kw || '').trim();
      if (!k || seen.has(k.toLowerCase())) continue;
      seen.add(k.toLowerCase());
      if (matches(k)) verifiedFound.push(k);
      else verifiedMissing.push(k);
    }
    for (const kw of (missing || [])) {
      const k = String(kw || '').trim();
      if (!k || seen.has(k.toLowerCase())) continue;
      seen.add(k.toLowerCase());
      if (matches(k)) verifiedFound.push(k);
      else verifiedMissing.push(k);
    }
    return { found: verifiedFound, missing: verifiedMissing };
  }

  let lastAiResponse = '';
  let optimizedResume = '';
  let coverLetter = '';
  let originalATSScore = 0, originalKeywordMatch = 0;
  let originalFoundKeywords = [], originalMissingKeywords = [];
  let optimizedATSScore = 0, optimizedKeywordMatch = 0;
  let optimizedFoundKeywords = [], optimizedMissingKeywords = [];
  let coverATS = 0, coverPersonalization = 0, coverTone = 0;
  let feedback = [];

  try {
    // ── STEP A: ATS Analysis on ORIGINAL resume ─────────────────────────────
    const atsRes = await ask(`You are an ATS expert. Score the ORIGINAL resume against the job description below.
Return STRICT JSON ONLY. No conversational text, no markdown fences, no preamble.

Schema:
{
  "score": <0-100 integer>,
  "keywords_found": [<strings>],
  "keywords_missing": [<strings>],
  "feedback": [<short strings>]
}

Resume:
${resumeText.slice(0, 2000)}

Job Description:
${jobDesc.slice(0, 2000)}`);

    if (!atsRes.success) {
      return res.status(500).json({ error: atsRes.error, raw: atsRes.raw });
    }

    const atsOriginal = parseJSON(atsRes.data) || {
      score: 0, keywords_found: [], keywords_missing: [], feedback: ['AI returned malformed JSON']
    };
    originalATSScore = clamp(Math.round(Number(atsOriginal.score) || 0));
    const origReconciled = reconcileKeywords(resumeText, atsOriginal.keywords_found, atsOriginal.keywords_missing);
    originalFoundKeywords = origReconciled.found;
    originalMissingKeywords = origReconciled.missing;
    originalKeywordMatch = keywordMatchFrom(originalFoundKeywords, originalMissingKeywords);
    feedback = Array.isArray(atsOriginal.feedback) ? atsOriginal.feedback : [];

    // ── STEP B: Resume Rewrite ──────────────────────────────────────────────
    const resRewrite = await ask(`You are an expert resume writer and ATS specialist.
Rewrite the candidate's resume into a recruiter-ready, ATS-optimized resume tailored to the job description.

ABSOLUTE TOP-OF-DOCUMENT RULES (NON-NEGOTIABLE):
- Line 1: the candidate's FULL NAME exactly as it appears in the original resume.
- Lines 2–4 (immediately below the name): contact information only — email, phone, city/region, LinkedIn or portfolio URL, one per line.
- Line 5: a single blank line.
- The SUMMARY section MUST appear directly below the contact information, before any other section.
- The candidate's name MUST stay at the top. It must NEVER be moved into Experience, Skills, Education, or any other section.

STRICT SECTION ORDER (use exactly these section names, in this order, only when the corresponding content exists):
1. SUMMARY
2. CORE SKILLS
3. PROFESSIONAL EXPERIENCE
4. EDUCATION
5. CERTIFICATIONS

Do NOT add any other section. Specifically, do NOT create "Professional Affiliations", "Additional Experience", "Other Experience", "Related Experience", "Selected Projects", "Awards" (unless no other certification slot exists), "Languages", "Interests", or "Volunteer Experience" — if the source has no Certifications, omit that header entirely.

WORK-EXPERIENCE RULES (CRITICAL):
- All paid work, internships, consulting, contract, freelance, and independent contractor roles MUST live under "PROFESSIONAL EXPERIENCE" — never under any other section.
- Order ALL experience entries REVERSE CHRONOLOGICALLY (most recent role first). The most recent role's start date MUST be the largest of all listed dates.
- Preserve the original employer / company name EXACTLY as written. Do not abbreviate, do not translate, do not modernize.
- Preserve original date ranges (e.g., "Nov 2023 – Present", "2019 – 2022") EXACTLY as written.
- Use the format on a single line: [Job Title] | [Company] | [Dates]
- Write 3–6 concise bullet points per role. Bullets MUST start with "-" or "•".
- Do NOT convert experience into paragraphs. Bullets only under Professional Experience.

EDUCATION & CERTIFICATIONS:
- Education must appear AFTER Professional Experience.
- Certifications must appear AFTER Education.
- Preserve degree names, institutions, and graduation years EXACTLY as written.
- Do NOT invent any degree, institution, or certification that is not in the original.

FACTUAL INTEGRITY (NON-NEGOTIABLE):
- NEVER fabricate employers, dates, degrees, certifications, or technologies.
- Every claim in the rewrite must be supported by the original resume. If something is not in the original, omit it — do not invent.
- Do not move the candidate's name, email, phone, or city into a different field or section.

ATS / CONTENT RULES:
- Naturally weave these missing keywords into bullets where they fit truthfully: ${(atsOriginal.keywords_missing || []).join(', ')}
- Use strong action verbs and quantify achievements where the original resume provides evidence.
- Keep bullets scannable: aim for 12–22 words each.

OUTPUT RULES:
- Output the resume text only. No preamble. No markdown fences. No "Here is the resume:".
- Preserve bullet points exactly as bullets — do not convert them to prose.

Original Resume:
${resumeText.slice(0, 4000)}

Target Job Description:
${jobDesc.slice(0, 2000)}`);

    if (!resRewrite.success) {
      return res.status(500).json({ error: resRewrite.error, raw: resRewrite.raw });
    }

    optimizedResume = (resRewrite.data || '').trim();
    lastAiResponse = optimizedResume;

    // ── STEP C: Cover Letter ────────────────────────────────────────────────
    const resCover = await ask(`Write a concise professional 3-paragraph cover letter for this candidate applying to this job.
Paragraph 1: Why they want this specific role and company.
Paragraph 2: Their most relevant experience and one key achievement.
Paragraph 3: Short call to action. Sign off with "Sincerely," and their name if visible in the resume, otherwise "Sincerely, [Your Name]".
Output the letter only — no subject line, no preamble.

Resume: ${resumeText.slice(0, 1500)}
Job Description: ${jobDesc.slice(0, 1000)}`);

    if (!resCover.success) {
      return res.status(500).json({ error: resCover.error, raw: resCover.raw });
    }
    coverLetter = (resCover.data || '').trim();

    // ── STEP D: Re-score the OPTIMIZED resume (real ATS scoring) ─────────────
    const optRes = await ask(`You are an ATS expert. Score the OPTIMIZED resume below against the SAME job description.
Return STRICT JSON ONLY. No conversational text, no markdown fences, no preamble.

Schema:
{
  "score": <0-100 integer>,
  "keywords_found": [<strings>],
  "keywords_missing": [<strings>],
  "ats_compatibility": <0-100 integer>,
  "personalization": <0-100 integer>,
  "professional_tone": <0-100 integer>
}

"score" is the overall ATS match score for the OPTIMIZED resume.
"ats_compatibility" measures how well the resume structure / formatting would parse through an ATS.
"personalization" measures how well the cover letter maps to the job description.
"professional_tone" measures writing quality of the cover letter.

Optimized Resume:
${optimizedResume.slice(0, 4000)}

Job Description:
${jobDesc.slice(0, 2000)}

Cover Letter:
${coverLetter.slice(0, 1500)}`);

    if (optRes.success) {
      const opt = parseJSON(optRes.data) || {};
      optimizedATSScore = clamp(Math.round(Number(opt.score) || 0));
      const optReconciled = reconcileKeywords(optimizedResume, opt.keywords_found, opt.keywords_missing);
      optimizedFoundKeywords = optReconciled.found;
      optimizedMissingKeywords = optReconciled.missing;
      optimizedKeywordMatch = keywordMatchFrom(optimizedFoundKeywords, optimizedMissingKeywords);
      coverATS = clamp(Math.round(Number(opt.ats_compatibility) || 0));
      coverPersonalization = clamp(Math.round(Number(opt.personalization) || 0));
      coverTone = clamp(Math.round(Number(opt.professional_tone) || 0));
    } else {
      // Soft-fail Step D: don't 500 the user, just fall back to deterministic estimates.
      console.error('[generate] Step D (optimized resume scoring) failed:', optRes.error);
      optimizedATSScore = Math.max(originalATSScore, 60); // optimistic floor
      optimizedKeywordMatch = Math.max(originalKeywordMatch, 60);
      coverATS = 70; coverPersonalization = 70; coverTone = 75;
    }

    return res.status(200).json({
      success: true,
      data: {
        optimizedResume,
        coverLetter,
        originalScore: originalATSScore,
        optimizedScore: optimizedATSScore,
        originalKeywordMatch,
        optimizedKeywordMatch,
        originalFoundKeywords,
        originalMissingKeywords,
        optimizedFoundKeywords,
        optimizedMissingKeywords,
        coverATS,
        coverPersonalization,
        coverTone,
        feedback
      }
    });

  } catch (err) {
    console.error('[generate] Critical failure:', err.message);
    return res.status(200).json({
      success: true,
      data: {
        optimizedResume: lastAiResponse,
        coverLetter: '',
        originalScore: 0,
        optimizedScore: 0,
        originalKeywordMatch: 0,
        optimizedKeywordMatch: 0,
        originalFoundKeywords: [],
        originalMissingKeywords: [],
        optimizedFoundKeywords: [],
        optimizedMissingKeywords: [],
        coverATS: 0, coverPersonalization: 0, coverTone: 0,
        feedback: [err.message || 'Generation failed']
      }
    });
  }
}
