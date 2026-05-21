// components/Field.jsx
import React from 'react';

export function Field({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  multiline, 
  rows = 3, 
  hint, 
  t 
}) {
  // Use optional chaining fallback to prevent runtime crashes if theme tokens are loading
  const base = {
    width: '100%', 
    boxSizing: 'border-box', 
    background: t?.inputBg || '#ffffff',
    border: `1px solid ${t?.border || '#e2e8f0'}`, 
    borderRadius: 8, 
    padding: '10px 12px',
    fontSize: 14, 
    color: t?.text || '#0f172a', 
    outline: 'none', 
    fontFamily: 'inherit',
    resize: 'none', 
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: t?.textSub || '#475569', letterSpacing: '0.03em' }}>
          {label}
        </label>
      )}
      
      {multiline ? (
        <textarea 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          rows={rows} 
          style={base}
          onFocus={e => e.target.style.borderColor = t?.accent || '#2563eb'}
          onBlur={e => e.target.style.borderColor = t?.border || '#e2e8f0'} 
        />
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder} 
          style={base}
          onFocus={e => e.target.style.borderColor = t?.accent || '#2563eb'}
          onBlur={e => e.target.style.borderColor = t?.border || '#e2e8f0'} 
        />
      )}
      
      {hint && (
        <span style={{ fontSize: 11, color: t?.textMuted || '#94a3b8' }}>
          {hint}
        </span>
      )}
    </div>
  );
}