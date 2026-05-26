import { MODEL } from './config';

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
    const response = await fetch(OPENROUTER_URL, {
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
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  function parseJSON(raw) {
    const clean = raw.replace(/```json|```/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in response');
    return JSON.parse(match[0]);
  }

  try {
    const atsRaw = await ask(`You are an ATS expert. Score this resume against the job description.
Return ONLY valid JSON — no explanation, no markdown fences:
{
  "before_score": <integer 0-100, honest current ATS match>,
  "after_score":  <integer 0-100, projected score after AI optimisation>,
  "keywords_found":   ["keyword1", "keyword2", "keyword3"],
  "keywords_missing": ["keyword1", "keyword2", "keyword3"],
  "feedback": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}

Resume:
${resumeText.slice(0, 2000)}

Job Description:
${jobDesc.slice(0, 2000)}`);

    const ats = parseJSON(atsRaw);

    const optimizedResume = await ask(`You are an expert resume writer and ATS specialist.
Rewrite the candidate's resume to be fully optimised for the job description below.

Rules:
- Extract and preserve ALL real experience, skills, and education from the old resume
- Never fabricate or exaggerate anything
- Naturally integrate these missing keywords: ${(ats.keywords_missing || []).join(', ')}
- Use strong action verbs; quantify achievements where evidence exists in the original
- Sections in this order: PROFESSIONAL SUMMARY, CORE SKILLS, WORK EXPERIENCE, EDUCATION
- Plain text only — use - for bullet points, no markdown, no symbols
- Output the resume text only, no preamble or explanation

Old Resume:
${resumeText.slice(0, 4000)}

Target Job Description:
${jobDesc.slice(0, 2000)}`);

    const coverLetter = await ask(`Write a concise professional 3-paragraph cover letter for this candidate applying to this job.
Paragraph 1: Why they want this specific role and company.
Paragraph 2: Their most relevant experience and one key achievement.
Paragraph 3: Short call to action. Sign off with "Sincerely," and their name if visible in the resume, otherwise "Sincerely, [Your Name]".
Output the letter only — no subject line, no preamble.

Resume: ${resumeText.slice(0, 1500)}
Job Description: ${jobDesc.slice(0, 1000)}`);

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
