import React from 'react';

// Inline mini-metric strip for the optimized resume / cover letter previews.
export function MetricStrip({ items, t }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="resume-metric-grid" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
      gap: 8,
      marginBottom: 12
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: t.elevated,
          border: `1px solid ${t.border}`,
          borderRadius: 10,
          padding: '8px 10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: item.color || t.text }}>
            {item.value}%
          </div>
          <div style={{
            fontSize: 9,
            color: t.textMuted,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: 2
          }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
