import React, { useState } from 'react';
import { Btn } from './Btn';
import { getOptimizationRating } from '../utils/rating';

export function AnalysisReport({ report, t }) {
  const [open, setOpen] = useState(true);
  if (!report) return null;

  const rating = getOptimizationRating(report.optimizedScore);
  const atsDelta = report.optimizedScore - report.originalScore;
  const keywordDelta = report.optimizedKeywordMatch - report.originalKeywordMatch;

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
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>
            <strong style={{ color: t.text }}>Overall Optimization Rating: </strong>
            <span style={{ color: rating.color, fontWeight: 700 }}>{rating.label}</span>
            <span style={{ color: t.textMuted }}> — based on a final ATS score of {report.optimizedScore}%.</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8
          }}>
            <SummaryRow label="Original ATS"  value={`${report.originalScore}%`}        t={t} muted />
            <SummaryRow label="Optimized ATS" value={`${report.optimizedScore}%`}       t={t} accent delta={atsDelta} />
            <SummaryRow label="Original Keywords" value={`${report.originalKeywordMatch}%` } t={t} muted />
            <SummaryRow label="Optimized Keywords" value={`${report.optimizedKeywordMatch}%`} t={t} accent delta={keywordDelta} />
            <SummaryRow label="Readability"   value={`${report.readability}%`}   t={t} />
            <SummaryRow label="Formatting"    value={`${report.formatting}%`}   t={t} />
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
