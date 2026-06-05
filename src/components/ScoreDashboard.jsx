import React from 'react';

export function ScoreDashboard({ data, t }) {
  const { originalScore = 0, optimizedScore = 0, foundKeywords = [], missingKeywords = [], feedback = [] } = data;

  const totalKeywords = foundKeywords.length + missingKeywords.length;
  const keywordMatchScore = totalKeywords > 0
    ? Math.round((foundKeywords.length / totalKeywords) * 100)
    : 0;

  // Heuristic for Readability and Formatting scores based on AI feedback
  const checkFeedbackFor = (keywords) =>
    feedback.some(f => keywords.some(k => f.toLowerCase().includes(k)));

  const isFormattingIssue = checkFeedbackFor(['formatting', 'layout', 'structure', 'bullet', 'font']);
  const isReadabilityIssue = checkFeedbackFor(['quantifiable', 'metrics', 'vague', 'stronger verbs', 'impact']);

  const formattingScore = isFormattingIssue ? 75 : 98;
  const readabilityScore = isReadabilityIssue ? 70 : 92;

  const metrics = [
    { label: 'ATS Match', value: optimizedScore, color: t.accent, icon: '🎯' },
    { label: 'Keyword Match', value: keywordMatchScore, color: t.green, icon: '🔑' },
    { label: 'Readability', value: readabilityScore, color: t.amber, icon: '📖' },
    { label: 'Formatting', value: formattingScore, color: t.green, icon: '📏' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
      marginBottom: 20
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: '16px',
          textAlign: 'center',
          transition: 'transform 0.2s',
          cursor: 'default'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: 20, marginBottom: 8 }}>{m.icon}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}%</div>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
