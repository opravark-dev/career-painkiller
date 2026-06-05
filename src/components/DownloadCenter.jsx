import React from 'react';
import { Btn } from './Btn';

export function DownloadCenter({ t, onDownloadRequest }) {
  const items = [
    {
      label: 'Optimized Resume',
      ext: '.txt',
      icon: '📄',
      desc: 'ATS-ready professional resume'
    },
    {
      label: 'Cover Letter',
      ext: '.txt',
      icon: '✉️',
      desc: 'Tailored application letter'
    },
    {
      label: 'Analysis Report',
      ext: '.pdf',
      icon: '📊',
      desc: 'Detailed score breakdown'
    }
  ];

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 20,
      padding: '24px',
      textAlign: 'center'
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: t.text }}>
        Export Your Documents
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: t.elevated,
            borderRadius: 12,
            border: `1px solid ${t.border}`,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
          onMouseOut={e => e.currentTarget.style.borderColor = t.border}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <div style={{ fontSize: 20 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>{item.desc}</div>
              </div>
            </div>
            <Btn
              small
              t={t}
              variant="primary"
              onClick={() => onDownloadRequest(item.label)}
            >
              Download {item.ext}
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}
