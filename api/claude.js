export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://career-painkiller.vercel.app",
          "X-Title": "Career Painkiller"
        },
        body: JSON.stringify(req.body)
      }
    );

    const text = await response.text();

    console.log("RAW RESPONSE:", text);

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (parseErr) {
      return res.status(500).json({
        error: "Invalid JSON returned",
        raw: text
      });
    }

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}