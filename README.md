# ResumeAI

AI-powered resume optimizer that tailors your resume to any job description in under 30 seconds.

## Features

- ATS-optimized resume rewrite (bullets, reverse-chronological, structured sections)
- Real ATS scoring on the OPTIMIZED resume (not the original)
- Keyword match analysis with found / missing breakdown
- Cover letter generator
- DOCX + PDF export for resume, cover letter, and analysis report
- Dark / light theme

## Stack

- React 18 + Vite
- OpenRouter (open-source LLM) for rewriting and scoring
- `docx` for Word export, `jspdf` for PDF export
- Vercel serverless functions (`/api/generate`, `/api/leads`)

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Set in `.env.local` (local) and the Vercel project (production):

- `OPENROUTER_API_KEY` — required for `/api/generate`
- `GOOGLE_SHEET_WEBHOOK_URL` — optional Apps Script webhook for `/api/leads`

## Branding

All references to the previous "Career Painkiller" working name have been removed.
The product, Vercel project, manifest, page title, and OpenRouter headers are all
`ResumeAI`.
