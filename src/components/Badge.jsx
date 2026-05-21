// components/Badge.jsx
import React from 'react';

export function Badge({ children, color = 'blue', t }) {
  const map = {
    blue: { bg: t?.accentBg || '#EFF6FF', text: t?.accentText || '#1D4ED8' },
    green: { bg: t?.greenBg || '#F0FDF4', text: t?.greenText || '#15803D' },
    amber: { bg: t?.amberBg || '#FFFBEB', text: t?.amberText || '#B45309' },
    red: { bg: t?.redBg || '#FFF1F1', text: t?.redText || '#B91C1C' },
  };

  const c = map[color] || map.blue;

  return (
    <span 
      style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11, 
        fontWeight: 600, 
        padding: '3px 8px', 
        borderRadius: 99, 
        background: c.bg, 
        color: c.text, 
        whiteSpace: 'nowrap',
        lineHeight: 1
      }}
    >
      {children}
    </span>
  );
}