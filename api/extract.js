// api/extract.js
// Receives: { text: string } (pre-extracted from PDF on frontend)
// Returns:  { role, summary, skills, experience }
// Model:    Claude 3.5 Haiku (cheap, fast)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Resume text too short or missing.' });
  }

  const prompt = `You are a resume parser. Extract structured data from this resume text.
Return ONLY valid JSON with exactly these keys (use empty string if missing):
{
  "role": "most recent or target job title",
  "summary": "2-sentence professional summary of the candidate",
  "skills": "comma-separated list of technical and soft skills",
  "experience": "2-3 sentence summary of work history with company names, roles, and years"
}
Resume text:
${text.slice(0, 6000)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const raw = data.content?.find(b => b.type === 'text')?.text || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');

    return res.status(200).json(JSON.parse(match[0]));
  } catch (err) {
    console.error('[extract]', err.message);
    return res.status(500).json({ error: err.message || 'Extraction failed' });
  }
}