export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, consent, score, name = 'Not Provided' } = req.body;

  if (!email || !consent) {
    return res.status(400).json({ error: 'Email and consent are required' });
  }

  const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    console.error('[Leads API] GOOGLE_SHEET_WEBHOOK_URL is not configured');
    // We still return success to the user so they can get their resume,
    // but we log the error internally.
    return res.status(200).json({ success: true, message: 'Lead captured (local only)' });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        consent,
        score,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Script responded with ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Leads API] Error sending to Google Sheets:', error.message);
    // Return success to avoid blocking the user's download
    return res.status(200).json({ success: true, warning: 'Lead stored locally' });
  }
}
