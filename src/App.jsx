import { useState, useRef } from 'react';
import { useTheme }    from './hooks/useTheme';
import { getT }        from './theme';
import { Field }       from './components/Field';
import { Btn }         from './components/Btn';
import { Badge }       from './components/Badge';
import { ATSBar }      from './components/ATSBar';
import { Spinner }     from './components/Spinner';
import { UpgradeLock } from './components/UpgradeLock';
import { Hero }         from './components/Hero';
import { HowItWorks }   from './components/HowItWorks';
import { SocialProof }   from './components/SocialProof';
import { UploadZone }   from './components/UploadZone';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ComparisonView } from './components/ComparisonView';
import { InsightPanel }   from './components/InsightPanel';
import { DownloadCenter } from './components/DownloadCenter';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { UpgradeModal }   from './components/UpgradeModal';
import { MetricStrip } from './components/MetricStrip';
import { AnalysisReport } from './components/AnalysisReport';
import { AINotice } from './components/AINotice';
import { trackEvent }   from './utils/analytics';
import { calculateFormattingScore, calculateReadabilityScore } from './utils/scoring';
import { getOptimizationRating } from './utils/rating';
import {
  downloadTxt,
  downloadResumeDocx, downloadResumePdf,
  downloadCoverLetterDocx, downloadCoverLetterPdf,
  downloadAnalysisReportDocx, downloadAnalysisReportPdf
} from './utils/exporters';

// Extract text from PDF in the browser — no API cost
async function extractPdfText(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs', import.meta.url
  ).toString();
  const ab  = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

const STEPS = ['Resume', 'Job', 'Results'];

export default function App() {
  const [dark, setDark] = useTheme();
  const t = getT(dark);

  const [step,       setStep]       = useState(0);
  const [resumeText, setResumeText] = useState('');
  const [jobDesc,    setJobDesc]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [loadMsg,    setLoadMsg]    = useState('');
  const [results,    setResults]    = useState(null);
  const [err,        setErr]        = useState('');
  const [showCover,  setShowCover]  = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState('');
  const [capturedName,  setCapturedName]  = useState('');

  // Upload + extract PDF text (browser-side)
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    trackEvent('upload_resume', { fileName: file.name, fileSize: file.size });
    setLoading(true); setErr('');
    try {
      setLoadMsg('Reading resume...');
      let text = '';
      if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        text = await extractPdfText(file);
      } else {
        text = await file.text();
      }
      if (text.trim().length < 50)
        throw new Error('Could not read enough text. Try a TXT file.');
      setResumeText(text);
      setStep(1);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  // Send to serverless API
  const generate = async () => {
    trackEvent('generate_resume', { resumeLength: resumeText.length, jobDescLength: jobDesc.length });
    setLoading(true); setErr('');
    try {
      setLoadMsg('Analysing job description...');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDesc }),
      });
      const raw = await res.text();

      if (!res.ok) {
        try {
          const errData = JSON.parse(raw);
          throw new Error(errData.error || 'Generation failed');
        } catch {
          throw new Error(raw || 'Generation failed');
        }
      }

      const parsed = JSON.parse(raw);
      if (!parsed.success) throw new Error(parsed.error || 'Generation failed');

      setResults(parsed);
      setStep(2);
    } catch (e) {
      console.error(e);
      setErr(e?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const reset = () => {
    setStep(0); setResults(null); setResumeText('');
    setJobDesc(''); setShowCover(false); setErr('');
    setPendingDownload(null);
  };

  // Build a comprehensive analysis-report object once, then reuse.
  // Source of truth for every score shown in Dashboard, Analysis Report,
  // Metric Strip, and Analysis Report downloads. Cover-letter metrics are
  // derived from the same `data` payload (same response, same numbers).
  const buildReport = (data) => {
    if (!data) return null;
    const optimizedResume = data.optimizedResume || '';
    const optimizedScore = data.optimizedScore ?? 0;
    return {
      originalScore: data.originalScore ?? 0,
      optimizedScore,
      originalKeywordMatch: data.originalKeywordMatch ?? 0,
      optimizedKeywordMatch: data.optimizedKeywordMatch ?? 0,
      readability: calculateReadabilityScore(optimizedResume),
      formatting: calculateFormattingScore(optimizedResume),
      feedback: data.feedback || [],
      coverATS: data.coverATS ?? 0,
      coverPersonalization: data.coverPersonalization ?? 0,
      coverTone: data.coverTone ?? 0,
      rating: getOptimizationRating(optimizedScore).label
    };
  };

  // One handler that supports TXT / DOCX / PDF for resume / cover / report.
  const handleDownload = async (docType, format) => {
    trackEvent('download_clicked', { docType, format });
    const data = results?.data || {};
    if (!capturedEmail) {
      setPendingDownload({ docType, format });
      setShowLeadCapture(true);
      return;
    }
    try {
      if (docType === 'Optimized Resume') {
        if (format === 'txt') downloadTxt(data.optimizedResume || '', 'Optimised_Resume.txt');
        else if (format === 'docx') await downloadResumeDocx(data.optimizedResume || '', 'Optimised_Resume.docx');
        else if (format === 'pdf')  await downloadResumePdf(data.optimizedResume || '', 'Optimised_Resume.pdf');
      } else if (docType === 'Cover Letter') {
        if (format === 'txt') downloadTxt(data.coverLetter || '', 'Cover_Letter.txt');
        else if (format === 'docx') await downloadCoverLetterDocx(data.coverLetter || '', 'Cover_Letter.docx');
        else if (format === 'pdf')  await downloadCoverLetterPdf(data.coverLetter || '', 'Cover_Letter.pdf');
      } else if (docType === 'Analysis Report') {
        if (format === 'pdf')  await downloadAnalysisReportPdf(report, 'ResumeAI_Report.pdf');
        else if (format === 'docx') await downloadAnalysisReportDocx(report, 'ResumeAI_Report.docx');
      }
    } catch (e) {
      console.error('Download failed:', e);
      alert('Could not generate the file. Please try again.');
    }
  };

  const handleLeadComplete = (email, name) => {
    setCapturedEmail(email);
    setCapturedName(name || '');
    setShowLeadCapture(false);
    trackEvent('email_captured', { email });
    if (pendingDownload) {
      const { docType, format } = pendingDownload;
      setPendingDownload(null);
      handleDownload(docType, format);
    }
  };

  const cardStyle = {
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: 14, padding: '20px',
  };

  const data = results?.data || {};
  const report = buildReport(data);

  const resumeMetrics = report ? [
    { label: 'ATS Score',     value: report.optimizedScore,       color: t.accent },
    { label: 'Keyword Match', value: report.optimizedKeywordMatch, color: t.green },
    { label: 'Readability',   value: report.readability,          color: t.amber },
    { label: 'Formatting',    value: report.formatting,           color: t.green }
  ] : [];

  const coverMetrics = report ? [
    { label: 'ATS Compatibility', value: report.coverATS,          color: t.accent },
    { label: 'Personalization',   value: report.coverPersonalization, color: t.green },
    { label: 'Professional Tone', value: report.coverTone,         color: t.amber }
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text,
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      transition: 'background 0.2s' }}>

      {/* ── Header ── */}
      <header style={{ background: t.surface, borderBottom: `1px solid ${t.border}`,
        padding: '13px 18px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            ResumeAI
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>
            AI Resume Optimizer
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setDark(d => !d)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} style={{
            width: 34, height: 34, borderRadius: 8,
            border: `1px solid ${t.border}`, background: t.elevated,
            cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => {
            trackEvent('upgrade_clicked', { location: 'header' });
            setShowUpgradeModal(true);
          }}
            style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 13px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit' }}>
            Upgrade Pro
          </button>
        </div>
      </header>

      <Hero t={t} />

      <main id="wizard" style={{ maxWidth: 440, margin: '0 auto', padding: '18px 14px 60px' }}>

        {/* ── Progress bar ── */}
        <nav className="progress-bar" aria-label="Progress" style={{ display: 'flex', alignItems: 'center', gap: 4,
          marginBottom: 20, padding: '10px 14px', background: t.surface,
          borderRadius: 12, border: `1px solid ${t.border}`, overflowX: 'auto' }}>
          {STEPS.map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 10,
                  fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
                  background: i < step ? t.green : i === step ? t.accent : t.elevated,
                  color: i <= step ? '#fff' : t.textMuted }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: i === step ? 600 : 400,
                  whiteSpace: 'nowrap',
                  color: i === step ? t.accent : i < step ? t.green : t.textMuted }}>
                  {l}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 14, height: 1,
                  background: i < step ? t.green : t.border,
                  flexShrink: 0, marginLeft: 2 }} />
              )}
            </div>
          ))}
        </nav>

        {/* ── STEP 0: Upload Resume ── */}
        {step === 0 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
              Upload your resume
            </h2>
            <p style={{ fontSize: 13, color: t.textSub, margin: '0 0 16px' }}>
              PDF or TXT — AI reads it and rewrites it for your target job.
            </p>
            <UploadZone
              onFileSelect={handleFile}
              resumeText={resumeText}
              loading={loading}
              err={err}
              t={t}
            />
            {loading && <Spinner msg={loadMsg} t={t} />}
            {err && <p style={{ fontSize: 12, color: t.red, margin: '10px 0 0' }}>{err}</p>}
            {resumeText && !loading && (
              <div style={{ marginTop: 16 }}>
                <Btn t={t} onClick={() => setStep(1)}>Continue →</Btn>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Job Description ── */}
        {step === 1 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
              Paste job description
            </h2>
            <p style={{ fontSize: 13, color: t.textSub, margin: '0 0 16px' }}>
              We'll rewrite your resume to match this role and score it against ATS.
            </p>
            <Field label="" value={jobDesc} onChange={setJobDesc}
              placeholder="Paste the full job description here..."
              multiline rows={14} t={t} />
            {err && <p style={{ fontSize: 12, color: t.red, margin: '10px 0 0' }}>{err}</p>}
            {loading && <Spinner msg={loadMsg} t={t} />}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Btn variant="secondary" t={t} onClick={() => setStep(0)}>← Back</Btn>
              <div style={{ flex: 1 }}>
                <Btn disabled={loading} t={t} onClick={() => {
                  if (!jobDesc.trim() || jobDesc.trim().length < 100) {
                    setErr('Paste the full job description (min 100 characters).');
                    return;
                  }
                  setErr(''); generate();
                }}>
                  {loading ? 'Optimising...' : '⚡ Optimise Resume'}
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Results ── */}
        {step === 2 && results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <ScoreDashboard data={data} t={t} />

            <InsightPanel data={data} t={t} />

            {/* Optimized resume preview with metrics above */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 8, padding: '0 4px' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Optimized Resume Preview</span>
                <Badge color="green" t={t}>Optimised</Badge>
              </div>
              <AINotice t={t} />
              <MetricStrip items={resumeMetrics} t={t} />
              <ComparisonView
                original={resumeText}
                optimized={data.optimizedResume || ''}
                t={t}
              />
            </div>

            <DownloadCenter
              t={t}
              onDownloadRequest={(label, format) => handleDownload(label, format || 'pdf')}
            />

            <UpgradeLock title="Export as PDF or DOCX"
              desc="Remove watermark and download a professionally formatted file ready for recruiters."
              t={t} />

            {/* Cover Letter Preview with metrics above */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Cover Letter Preview</span>
                  <Badge color="amber" t={t}>Preview</Badge>
                </div>
                <button onClick={() => setShowCover(s => !s)} style={{ fontSize: 12, color: t.accent,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 500 }}>
                  {showCover ? 'Hide ↑' : 'Preview ↓'}
                </button>
              </div>
              {showCover && (
                <>
                  <AINotice t={t} />
                  <MetricStrip items={coverMetrics} t={t} />
                  <pre style={{ fontSize: 12, lineHeight: 1.8, color: t.textSub,
                    whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                    {data.coverLetter || ''}
                  </pre>
                </>
              )}
            </div>

            {/* Analysis Report */}
            {report && <AnalysisReport report={report} t={t} />}

            <button onClick={reset} style={{ background: 'none', border: 'none',
              color: t.textMuted, fontSize: 13, cursor: 'pointer',
              padding: '8px', fontFamily: 'inherit', marginTop: 4 }}>
              ↺ Start over
            </button>
          </div>
        )}
      </main>

      <HowItWorks t={t} />
      <SocialProof t={t} />

      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => {
          setShowLeadCapture(false);
          setPendingDownload(null);
        }}
        onComplete={handleLeadComplete}
        score={data.optimizedScore}
        t={t}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        t={t}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::placeholder { color: ${t.textMuted}; opacity: 1; }
        .progress-bar::-webkit-scrollbar { height: 4px; }
        .progress-bar::-webkit-scrollbar-track { background: ${t.elevated}; border-radius: 99px; }
        .progress-bar::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 99px; }
        .progress-bar::-webkit-scrollbar-thumb:hover { background: ${t.textMuted}; }
        .progress-bar { scrollbar-width: thin; scrollbar-color: ${t.border} ${t.elevated}; }
        *:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Mobile responsiveness (320 / 360 / 390 / 768) ── */
        html, body { overflow-x: hidden; }

        /* Hero text scales down on small screens so it never overflows. */
        @media (max-width: 480px) {
          main[id="wizard"] { padding: 14px 12px 56px !important; }
          h1 { font-size: 30px !important; line-height: 1.15 !important; }
          section h1 + p { font-size: 15px !important; }
        }
        @media (max-width: 360px) {
          h1 { font-size: 26px !important; }
        }

        /* Metric strip / score grid: 2 columns on phones, 4 on tablet+ */
        @media (max-width: 480px) {
          .resume-metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (min-width: 768px) {
          .resume-metric-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }

        /* Cover letter <pre>: ensure it wraps inside narrow viewports. */
        pre { max-width: 100%; word-break: break-word; overflow-wrap: anywhere; }

        /* Modals: never let the inner panel exceed the viewport minus padding. */
        @media (max-width: 480px) {
          .modal-panel { max-width: 100% !important; padding: 22px !important; border-radius: 18px !important; }
        }
      `}</style>
    </div>
  );
}
