// api/extract.js
// POST { text: string }  (pre-extracted from PDF on frontend)
// Returns { role, summary, skills, experience }
// Model: deepseek/deepseek-chat-v3-0324:free via OpenRouter

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text || text.trim().length < 50)
    return res.status(400).json({ error: 'Resume text too short or missing.' });

  const prompt = `You are a resume parser. Extract structured data from this resume text.
Return ONLY valid JSON with exactly these keys (use empty string if a field is missing):
{
  "role":       "most recent or target job title",
  "summary":    "2-sentence professional summary of the candidate",
  "skills":     "comma-separated list of technical and soft skills",
  "experience": "2-3 sentence summary of work history with company names, roles, and years"
}

Resume text:
${text.slice(0, 6000)}`;

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const d = await r.json();
    if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));

    const raw   = d.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in response');

    return res.status(200).json(JSON.parse(match[0]));

  } catch (err) {
    console.error('[extract]', err.message);
    return res.status(500).json({ error: err.message || 'Extraction failed' });
  }
}