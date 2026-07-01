import React, { useState } from 'react';

// Format picker dropdown. PDF is the primary call-to-action;
// DOCX is the recruiter-friendly default. TXT is exposed for completeness.
export function DownloadCenter({ t, onDownloadRequest }) {
  const items = [
    { label: 'Optimized Resume', icon: '📄', desc: 'ATS-ready professional resume', formats: [
      { ext: 'pdf',  primary: true,  label: 'PDF' },
      { ext: 'docx', primary: false, label: 'DOCX' },
      { ext: 'txt',  primary: false, label: 'TXT' }
    ]},
    { label: 'Cover Letter', icon: '✉️', desc: 'Tailored application letter', formats: [
      { ext: 'pdf',  primary: true,  label: 'PDF' },
      { ext: 'docx', primary: false, label: 'DOCX' },
      { ext: 'txt',  primary: false, label: 'TXT' }
    ]},
    { label: 'Analysis Report', icon: '📊', desc: 'Detailed score breakdown', formats: [
      { ext: 'pdf',  primary: true,  label: 'PDF' },
      { ext: 'docx', primary: false, label: 'DOCX' }
    ]}
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
          <DownloadRow key={i} item={item} t={t} onDownloadRequest={onDownloadRequest} />
        ))}
      </div>
    </div>
  );
}

function DownloadRow({ item, t, onDownloadRequest }) {
  const [open, setOpen] = useState(false);
  const primary = item.formats.find(f => f.primary) || item.formats[0];

  return (
    <div style={{
      background: t.elevated,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: '12px 14px',
      transition: 'all 0.2s',
      textAlign: 'left'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
    onMouseOut={e => e.currentTarget.style.borderColor = t.border}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 20 }}>{item.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: t.textMuted }}>{item.desc}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => onDownloadRequest(item.label, primary.ext)}
            style={{
              background: t.accent, color: '#fff', border: 'none',
              borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit'
            }}
            onMouseOver={e => e.currentTarget.style.background = t.accentHov}
            onMouseOut={e => e.currentTarget.style.background = t.accent}
          >
            Download .{primary.ext.toUpperCase()}
          </button>
          {item.formats.length > 1 && (
            <button
              onClick={() => setOpen(o => !o)}
              aria-label="More formats"
              style={{
                background: 'transparent', color: t.textSub,
                border: `1px solid ${t.border}`, borderRadius: 8,
                padding: '7px 9px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {open ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>
      {open && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {item.formats.filter(f => !f.primary).map(f => (
            <button
              key={f.ext}
              onClick={() => { setOpen(false); onDownloadRequest(item.label, f.ext); }}
              style={{
                background: t.surface, color: t.text, border: `1px solid ${t.border}`,
                borderRadius: 99, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              .{f.ext.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
