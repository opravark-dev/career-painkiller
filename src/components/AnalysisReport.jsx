import React, { useState } from 'react';
import { AINotice } from './AINotice';
import { getOptimizationRating, formatDelta } from '../utils/rating';

// Generate a short recommendation per metric when one isn't otherwise supplied.
function defaultRecommendation(key, value) {
  switch (key) {
    case 'ats':
      if (value >= 80) return 'Strong match — your resume is well-aligned with this job description.';
      if (value >= 60) return 'Good base. Tighten bullets to mirror the most specific job requirements.';
      return 'Add the missing keywords from the analysis above and re-run for a higher score.';
    case 'keyword':
      if (value >= 80) return 'Most required keywords are present. Verify any domain-specific terms with the job posting.';
      if (value >= 60) return 'Add 2–3 missing skills to the Core Skills section and weave them into recent experience bullets.';
      return 'Inject the critical missing keywords into your Summary, Skills, and most recent role bullets.';
    case 'readability':
      if (value >= 80) return 'Bullets are crisp and scannable. Recruiters will parse this in under a minute.';
      if (value >= 60) return 'Trim any bullets over 25 words. Lead each with a strong action verb.';
      return 'Shorten bullets (12–22 words), and add at least 5 bullet points to each role.';
    case 'formatting':
      if (value >= 80) return 'Section structure is ATS-friendly. Keep these standard headers.';
      if (value >= 60) return 'Add the missing standard section (Summary, Skills, Experience, Education, or Certifications).';
      return 'Restructure into Summary → Skills → Experience → Education → Certifications with those exact section names.';
    default:
      return '';
  }
}

const EXPLANATIONS = {
  ats:        'How closely the optimized resume matches the job requirements.',
  keyword:    'Percentage of required keywords found in the optimized resume.',
  readability:'Resume clarity and scanability, based on bullet length and count.',
  formatting: 'ATS compatibility and section structure (Summary, Skills, Experience, Education, Certifications).'
};

export function AnalysisReport({ report, t }) {
  const [open, setOpen] = useState(true);
  if (!report) return null;

  const rating = getOptimizationRating(report.optimizedScore);
  const atsDelta = report.optimizedScore - report.originalScore;
  const keywordDelta = report.optimizedKeywordMatch - report.originalKeywordMatch;

  const rows = [
    { key: 'ats',         label: 'ATS Match',     value: report.optimizedScore,        delta: atsDelta,         color: t.accent, icon: '🎯' },
    { key: 'keyword',     label: 'Keyword Match', value: report.optimizedKeywordMatch, delta: keywordDelta,     color: t.green,  icon: '🔑' },
    { key: 'readability', label: 'Readability',   value: report.readability,           delta: null,             color: t.amber,  icon: '📖' },
    { key: 'formatting',  label: 'Formatting',    value: report.formatting,            delta: null,             color: t.green,  icon: '📏' }
  ];

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      marginBottom: 20,
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: t.elevated,
        borderBottom: open ? `1px solid ${t.border}` : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Analysis Report</span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: rating.color,
            background: rating.color + '15',
            border: `1px solid ${rating.color}`,
            padding: '2px 8px',
            borderRadius: 99,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            {rating.label}
          </span>
        </div>
        <button onClick={() => setOpen(s => !s)} style={{
          fontSize: 12, color: t.accent,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 500
        }}>
          {open ? 'Hide ↑' : 'Preview ↓'}
        </button>
      </div>

      {open && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI Notice — required disclosure */}
          <AINotice t={t} />

          {/* ── Overall Optimization Rating (large) ──────────────────────── */}
          <div style={{
            background: t.elevated,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: t.textMuted, textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Overall Optimization Rating
            </div>
            <div style={{
              fontSize: 56, fontWeight: 800, lineHeight: 1,
              color: rating.color, letterSpacing: '-0.03em'
            }}>
              {report.optimizedScore}%
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700,
              color: rating.color
            }}>
              {rating.label}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
              Final ATS score — based on keyword match, structure, and job alignment.
            </div>
          </div>

          {/* ── Four core metrics with %, explanation, recommendation ─────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map(r => (
              <MetricDetailRow
                key={r.key}
                label={r.label}
                value={r.value}
                delta={r.delta}
                explanation={EXPLANATIONS[r.key]}
                recommendation={defaultRecommendation(r.key, r.value)}
                color={r.color}
                icon={r.icon}
                t={t}
              />
            ))}
          </div>

          {/* Original → Optimized comparison (preserved) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8
          }}>
            <SummaryRow label="Original ATS"  value={`${report.originalScore}%`}        t={t} muted />
            <SummaryRow label="Optimized ATS" value={`${report.optimizedScore}%`}       t={t} accent delta={atsDelta} />
            <SummaryRow label="Original Keywords" value={`${report.originalKeywordMatch}%` } t={t} muted />
            <SummaryRow label="Optimized Keywords" value={`${report.optimizedKeywordMatch}%`} t={t} accent delta={keywordDelta} />
          </div>

          {report.feedback?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Top Recommendations
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: t.textSub, lineHeight: 1.6 }}>
                {report.feedback.slice(0, 5).map((f, i) => (<li key={i}>{f}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricDetailRow({ label, value, delta, explanation, recommendation, color, icon, t }) {
  return (
    <div style={{
      background: t.elevated,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: t.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color }}>
            {value}%
          </span>
          {typeof delta === 'number' && delta !== 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: delta > 0 ? t.green : t.red,
              background: delta > 0 ? t.greenBg : t.redBg,
              border: `1px solid ${delta > 0 ? t.green : t.red}`,
              padding: '1px 5px',
              borderRadius: 99
            }}>
              {formatDelta(delta)}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 12, color: t.textSub, lineHeight: 1.45 }}>
        {explanation}
      </div>
      <div style={{
        fontSize: 12, color: t.textMuted, lineHeight: 1.45,
        paddingTop: 4, borderTop: `1px solid ${t.border}`,
        marginTop: 4
      }}>
        <span style={{ color: color, fontWeight: 700 }}>Recommendation: </span>
        {recommendation}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, t, muted = false, accent = false, delta }) {
  return (
    <div style={{
      background: t.elevated,
      border: `1px solid ${t.border}`,
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span style={{ fontSize: 11, color: muted ? t.textMuted : t.textSub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: accent ? t.accent : t.text }}>
          {value}
        </span>
        {typeof delta === 'number' && delta !== 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: delta > 0 ? t.green : t.red,
            background: delta > 0 ? t.greenBg : t.redBg,
            border: `1px solid ${delta > 0 ? t.green : t.red}`,
            padding: '1px 5px',
            borderRadius: 99
          }}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </span>
    </div>
  );
}
