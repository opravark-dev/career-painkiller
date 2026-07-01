import React from 'react';
import { calculateFormattingScore, calculateReadabilityScore } from '../utils/scoring';
import { getOptimizationRating, formatDelta } from '../utils/rating';

const EXPLANATIONS = {
  ats: 'How closely the optimized resume matches the job requirements.',
  keyword: 'Percentage of required keywords found in the optimized resume.',
  readability: 'Resume clarity and scanability, based on bullet length and count.',
  formatting: 'ATS compatibility and section structure (Summary, Skills, Experience, Education, Certifications).'
};

function MetricCard({ label, value, explanation, color, icon, delta, t, dark = false }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      padding: '16px',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}%</div>
        {typeof delta === 'number' && delta !== 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: delta > 0 ? t.green : t.red,
            background: delta > 0 ? t.greenBg : t.redBg,
            border: `1px solid ${delta > 0 ? t.green : t.red}`,
            padding: '2px 6px',
            borderRadius: 99
          }}>
            {formatDelta(delta)} pts
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.35, marginTop: 6, minHeight: 28 }}>
        {explanation}
      </div>
    </div>
  );
}

export function ScoreDashboard({ data, t }) {
  const {
    originalScore = 0,
    optimizedScore = 0,
    originalKeywordMatch = 0,
    optimizedKeywordMatch = 0,
    optimizedFoundKeywords = [],
    optimizedMissingKeywords = [],
    optimizedResume = ''
  } = data || {};

  const formattingScore = calculateFormattingScore(optimizedResume);
  const readabilityScore = calculateReadabilityScore(optimizedResume);
  const rating = getOptimizationRating(optimizedScore);

  const atsDelta = optimizedScore - originalScore;
  const keywordDelta = optimizedKeywordMatch - originalKeywordMatch;

  const metrics = [
    { label: 'ATS Match',     value: optimizedScore,       delta: atsDelta,     color: t.accent, icon: '🎯', explanation: EXPLANATIONS.ats },
    { label: 'Keyword Match', value: optimizedKeywordMatch, delta: keywordDelta, color: t.green,  icon: '🔑', explanation: EXPLANATIONS.keyword },
    { label: 'Readability',   value: readabilityScore,     delta: null,         color: t.amber,  icon: '📖', explanation: EXPLANATIONS.readability },
    { label: 'Formatting',    value: formattingScore,      delta: null,         color: t.green,  icon: '📏', explanation: EXPLANATIONS.formatting }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
      {/* Header row with the optimization rating chip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Optimized Resume Score</h3>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: rating.color,
          background: rating.color + '15',
          border: `1px solid ${rating.color}`,
          padding: '4px 10px',
          borderRadius: 99,
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          {rating.label}
        </span>
      </div>

      <div className="resume-metric-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12
      }}>
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} t={t} />
        ))}
      </div>

      {/* Original → Optimized comparison */}
      <div style={{
        background: t.elevated,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: '12px 16px',
        fontSize: 12,
        color: t.textSub,
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>
            Original → Optimized
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ATS Score</span>
          <span>
            <span style={{ color: t.textMuted }}>{originalScore}%</span>
            <span style={{ margin: '0 8px', color: t.textMuted }}>→</span>
            <span style={{ color: t.accent, fontWeight: 700 }}>{optimizedScore}%</span>
            {atsDelta !== 0 && (
              <span style={{ marginLeft: 8, color: atsDelta > 0 ? t.green : t.red, fontWeight: 700 }}>
                ({formatDelta(atsDelta)} ATS points)
              </span>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Keyword Match</span>
          <span>
            <span style={{ color: t.textMuted }}>{originalKeywordMatch}%</span>
            <span style={{ margin: '0 8px', color: t.textMuted }}>→</span>
            <span style={{ color: t.green, fontWeight: 700 }}>{optimizedKeywordMatch}%</span>
            {keywordDelta !== 0 && (
              <span style={{ marginLeft: 8, color: keywordDelta > 0 ? t.green : t.red, fontWeight: 700 }}>
                ({formatDelta(keywordDelta)} keyword points)
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
