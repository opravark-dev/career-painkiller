// api/generate.js
// POST { resumeText, jobDesc }
// Returns { beforeScore, afterScore, keywordsFound, keywordsMissing, feedback, optimizedResume, coverLetter }

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { resumeText, jobDesc } = req.body;

  if (!resumeText || resumeText.trim().length < 50)
    return res.status(400).json({ error: 'Resume text too short or missing.' });
  if (!jobDesc || jobDesc.trim().length < 100)
    return res.status(400).json({ error: 'Job description too short.' });

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  try {
    // ── STEP A: ATS Analysis (Haiku — fast & cheap) ──
    const atsPrompt = `You are an ATS expert. Score this resume against the job description.
Return ONLY valid JSON, no explanation, no markdown:
{
  "before_score": <integer 0-100, honest current ATS match>,
  "after_score": <integer 0-100, projected after optimisation>,
  "keywords_found": ["keyword1", "keyword2", "keyword3"],
  "keywords_missing": ["keyword1", "keyword2", "keyword3"],
  "feedback": ["tip1", "tip2", "tip3"]
}

Resume:
${resumeText.slice(0, 2000)}

Job Description:
${jobDesc.slice(0, 2000)}`;

    const atsRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers,
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: atsPrompt }],
      }),
    });
    const atsData = await atsRes.json();
    if (atsData.error) throw new Error(atsData.error.message);
    const atsRaw = atsData.content?.find(b => b.type === 'text')?.text || '';
    const atsMatch = atsRaw.match(/\{[\s\S]*\}/);
    if (!atsMatch) throw new Error('ATS parse failed');
    const ats = JSON.parse(atsMatch[0]);

    // ── STEP B: Resume Rewrite (Sonnet — quality) ──
    const resumePrompt = `You are an expert resume writer and ATS specialist.
Rewrite the candidate's resume to be fully optimised for the job description below.

Rules:
- Extract and preserve ALL real experience, skills, education from the old resume
- Never fabricate or exaggerate anything
- Naturally integrate these missing keywords: ${(ats.keywords_missing || []).join(', ')}
- Use strong action verbs, quantify achievements where evidence exists
- Sections in this order: PROFESSIONAL SUMMARY, CORE SKILLS, WORK EXPERIENCE, EDUCATION
- Plain text only — use - for bullet points, no markdown, no symbols
- Output the resume only, no preamble or explanation

Old Resume:
${resumeText.slice(0, 4000)}

Target Job Description:
${jobDesc.slice(0, 2000)}`;

    const resumeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers,
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: resumePrompt }],
      }),
    });
    const resumeData = await resumeRes.json();
    if (resumeData.error) throw new Error(resumeData.error.message);
    const optimizedResume = resumeData.content?.find(b => b.type === 'text')?.text || '';

    // ── STEP C: Cover Letter (Haiku — premium, keep cheap) ──
    const clPrompt = `Write a concise professional 3-paragraph cover letter based on this resume for this job.
Paragraph 1: Why they want this specific role and company.
Paragraph 2: Most relevant experience and one key achievement.
Paragraph 3: Short call to action. Sign off with "Sincerely," and their name if visible, else "Sincerely, [Your Name]".
Output the letter only — no subject line, no preamble.

Resume: ${resumeText.slice(0, 1500)}
Job: ${jobDesc.slice(0, 1000)}`;

    const clRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers,
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: clPrompt }],
      }),
    });
    const clData = await clRes.json();
    const coverLetter = clData.content?.find(b => b.type === 'text')?.text || '';

    return res.status(200).json({
      beforeScore:     ats.before_score,
      afterScore:      ats.after_score,
      keywordsFound:   ats.keywords_found   || [],
      keywordsMissing: ats.keywords_missing || [],
      feedback:        ats.feedback         || [],
      optimizedResume,
      coverLetter,
    });

  } catch (err) {
    console.error('[generate]', err.message);
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
}