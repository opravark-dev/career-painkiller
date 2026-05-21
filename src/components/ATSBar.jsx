// components/ATSBar.jsx
import React from 'react';

export function ATSBar({ score = 0, label, t }) {
  // Ensure the score stays within bounds for rendering the visual bar width safely
  const safeScore = Math.max(0, Math.min(100, score));
  
  const color = safeScore >= 75 ? t?.green : safeScore >= 50 ? t?.amber : t?.red;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, color: t?.textSub || '#475569', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: 20, fontWeight: 700, color: color || '#3B82F6' }}>
          {score}
          <span style={{ fontSize: 12, fontWeight: 400, color: t?.textMuted || '#94A3B8' }}>
            /100
          </span>
        </span>
      </div>
      
      {/* Visual Progress Bar Track */}
      <div style={{ background: t?.border || '#E2E8F0', borderRadius: 99, height: 8, overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${safeScore}%`, 
            height: '100%', 
            background: color || '#3B82F6', 
            borderRadius: 99, 
            transition: 'width 1s ease' 
          }} 
        />
      </div>
    </div>
  );
}