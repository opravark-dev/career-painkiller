// api/generate.js
// Receives: { name, email, phone, role, summary, skills, experience, jobDesc }
// Returns:  { beforeScore, afterScore, keywordsFound, keywordsMissing, feedback, optimizedResume, coverLetter }
// Models:   Haiku for ATS analysis, Sonnet for resume rewrite

// ── 1. RATE LIMITER CONFIGURATION (In-Memory Fallback) ──
const rateLimitCache = new Map();

async function checkRateLimit(req) {
  // Extract client IP address, accounting for Vercel's proxy setup
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  
  // Track unique IP + Day combinations
  const todayKey = `ratelimit:${ip}:${new Date().toDateString()}`;

  if (rateLimitCache.has(todayKey)) {
    return { isLimited: true };
  }

  // Record generation for today
  rateLimitCache.set(todayKey, true);
  return { isLimited: false };
}

// ── 2. MAIN GENERATION HANDLER ──
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 👉 RUN RATE LIMIT CHECK FIRST BEFORE PROMPTS CALLS
  const { isLimited } = await checkRateLimit(req);
  if (isLimited) {
    return res.status(429).json({ 
      error: 'Free limit reached. Upgrade to Career Pro for unlimited access.' 
    });
  }

  const { name, email, phone, role, summary, skills, experience, jobDesc } = req.body;

  if (!jobDesc || jobDesc.trim().length < 100) {
    return res.status(400).json({ error: 'Job description too short.' });
  }
  if (!experience || experience.trim().length < 30) {
    return res.status(400).json({ error: 'Resume data missing.' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  try {
    // ── Step A: ATS Analysis (Haiku — cheap) ──
    const atsPrompt = `You are an ATS (Applicant Tracking System) expert.
Analyse this resume against the job description. Return ONLY valid JSON:
{
  "before_score": 70,
  "after_score": 95,
  "keywords_found": ["keyword1", "keyword2", "keyword3"],
  "keywords_missing": ["keyword4", "keyword5", "keyword6"],
  "feedback": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}
Resume:
Name: ${name}
Role: ${role}
Skills: ${skills}
Experience: ${experience}

Job Description:
${jobDesc.slice(0, 2000)}`;

    const atsRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: atsPrompt }],
      }),
    });

    const atsData = await atsRes.json();
    if (atsData.error) throw new Error(atsData.error.message);
    
    const atsRaw = atsData.content?.find(b => b.type === 'text')?.text || '';
    const atsMatch = atsRaw.match(/\{[\s\S]*\}/);
    if (!atsMatch) throw new Error('ATS JSON parse failed');
    const ats = JSON.parse(atsMatch[0]);

    // ── Step B: Resume Rewrite (Sonnet — quality) ──
    const resumePrompt = `You are an expert resume writer specialising in ATS optimisation.
Rewrite this candidate's resume to maximise match with the job description.

Rules:
- Preserve all truthful experience — never fabricate
- Naturally integrate missing keywords: ${(ats.keywords_missing || []).join(', ')}
- Use strong action verbs and quantified achievements where possible
- Format clearly with these sections: CONTACT INFO, PROFESSIONAL SUMMARY, CORE SKILLS, WORK EXPERIENCE, EDUCATION
- Use plain text with - for bullets (no markdown, no symbols)
- Output the resume only, no preamble

Candidate:
Name: ${name} | Email: ${email} | Phone: ${phone}
Role: ${role}
Summary: ${summary}
Skills: ${skills}
Experience: ${experience}

Target Job Description:
${jobDesc.slice(0, 2000)}`;

    const resumeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: resumePrompt }],
      }),
    });

    const resumeData = await resumeRes.json();
    if (resumeData.error) throw new Error(resumeData.error.message);
    const optimizedResume = resumeData.content?.find(b => b.type === 'text')?.text || '';

    // ── Step C: Cover Letter (Haiku — premium feature, keep cheap) ──
    const clPrompt = `Write a concise, professional 3-paragraph cover letter for this candidate applying to this role.
Paragraph 1: Why they want this role and company.
Paragraph 2: Their most relevant experience and achievements.
Paragraph 3: Call to action. Sign off as ${name}.
Output the letter only, no subject line.

Candidate: ${name}, ${role}, ${summary}
Job: ${jobDesc.slice(0, 1000)}`;

    const clRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: clPrompt }],
      }),
    });

    const clData = await clRes.json();
    const coverLetter = clData.content?.find(b => b.type === 'text')?.text || '';

    return res.status(200).json({
      beforeScore: ats.before_score || 0,
      afterScore: ats.after_score || 0,
      keywordsFound: ats.keywords_found || [],
      keywordsMissing: ats.keywords_missing || [],
      feedback: ats.feedback || [],
      optimizedResume,
      coverLetter,
    });

  } catch (err) {
    console.error('[generate]', err.message);
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
}