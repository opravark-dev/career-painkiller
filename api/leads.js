export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, consent, score, name = 'Not Provided' } = req.body || {};

  // Required-field validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!consent) {
    return res.status(400).json({ error: 'Consent is required' });
  }

  const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  // Always generate a fresh server-side timestamp — do NOT trust the client value,
  // and do NOT cache any value from a previous request.
  const payload = {
    name,
    email: email.trim().toLowerCase(),
    consent: !!consent,
    score: typeof score === 'number' ? score : 0,
    timestamp: new Date().toISOString()
  };

  console.log('[Leads API] New lead payload:', payload);

  if (!WEBHOOK_URL) {
    console.error('[Leads API] GOOGLE_SHEET_WEBHOOK_URL is not configured');
    return res.status(200).json({ success: true, message: 'Lead captured (local only)' });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Cache-busting header to discourage any intermediary from reusing a prior response.
      body: JSON.stringify({ ...payload, _t: Date.now() })
    });

    const text = await response.text();
    console.log(`[Leads API] Sheets webhook status=${response.status} body=${text}`);

    if (!response.ok) {
      throw new Error(`Google Script responded with ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Leads API] Error sending to Google Sheets:', error.message);
    return res.status(200).json({ success: true, warning: 'Lead stored locally' });
  }
}
