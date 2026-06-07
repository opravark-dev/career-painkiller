import { MODEL } from './config.js';

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
          'HTTP-Referer': 'https://career-painkiller.vercel.app',
          'X-Title': 'Career Painkiller'
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
        return {
          success: false,
          error: `OpenRouter request failed with status ${r.status}`,
          raw
        };
      }

      let d;
      try {
        d = JSON.parse(raw);
      } catch (e) {
        return {
          success: false,
          error: "Invalid JSON returned from OpenRouter",
          raw
        };
      }

      const content = d.choices?.[0]?.message?.content || '';
      if (!content) {
        return {
          success: false,
          error: "OpenRouter returned an empty or malformed response",
          raw
        };
      }

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
      // Regex to find the first '{' and last '}' to isolate the JSON block
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

  let lastAiResponse = "";
  try {
    // ── STEP A: ATS Analysis ──────────────────────────────────────────────────
    const atsRes = await ask(`You are an ATS expert. Score this resume against the job description.
Return STRICT JSON ONLY. No conversational text, no markdown fences, no preamble.

Schema Example:
{
  "before_score": 45,
  "after_score": 85,
  "keywords_found": ["React", "TypeScript"],
  "keywords_missing": ["AWS", "Docker"],
  "feedback": ["Add more quantifiable achievements", "Highlight cloud experience"]
}

Resume:
${resumeText.slice(0, 2000)}

Job Description:
${jobDesc.slice(0, 2000)}`);

    if (!atsRes.success) {
      return res.status(500).json({ error: atsRes.error, raw: atsRes.raw });
    }

    const ats = parseJSON(atsRes.data) || {
      before_score: 0,
      after_score: 0,
      keywords_found: [],
      keywords_missing: [],
      feedback: ["AI returned malformed JSON"]
    };

    // ── STEP B: Resume Rewrite ────────────────────────────────────────────────
    const resRewrite = await ask(`You are an expert resume writer and ATS specialist.
Rewrite the candidate's resume to be a recruiter-ready, professionally formatted ATS resume optimized for the job description below.

Strict Formatting Rules:
- PRESERVE all section headings, bullet points, dates, employer names, and chronology.
- Use a professional, clean structure.
- NEVER return paragraphs where bullet points are expected (e.g., in the Experience section).
- Use a clear, consistent format: [Job Title] | [Company] | [Dates]
- Output the resume text only, no preamble or explanation.

Optimization Rules:
- Extract and preserve ALL real experience, skills, and education from the old resume.
- Never fabricate or exaggerate details.
- Naturally integrate these missing keywords: ${(ats.keywords_missing || []).join(', ')}.
- Use strong action verbs and quantify achievements where evidence exists.
- Maintain high readability: keep bullet points concise and impactful.
- Ensure the final output is concise, scannable, and recruiter-friendly.

Old Resume:
${resumeText.slice(0, 4000)}

Target Job Description:
${jobDesc.slice(0, 2000)}`);

    if (!resRewrite.success) {
      return res.status(500).json({ error: resRewrite.error, raw: resRewrite.raw });
    }

    const optimizedResume = resRewrite.data;
    lastAiResponse = optimizedResume;

    // ── STEP C: Cover Letter ──────────────────────────────────────────────────
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

    const coverLetter = resCover.data;

    return res.status(200).json({
      success: true,
      data: {
        optimizedResume: optimizedResume || '',
        originalScore: ats.before_score || 0,
        optimizedScore: ats.after_score || 0,
        foundKeywords: ats.keywords_found || [],
        missingKeywords: ats.keywords_missing || [],
        coverLetter: coverLetter || '',
        feedback: ats.feedback || []
      }
    });

  } catch (err) {
    console.error('[generate] Critical failure:', err.message);
    return res.status(200).json({
      success: true,
      data: {
        optimizedResume: lastAiResponse,
        originalScore: 0,
        optimizedScore: 0,
        foundKeywords: [],
        missingKeywords: [],
        coverLetter: "",
        feedback: [err.message || "Generation failed"]
      }
    });
  }
}
