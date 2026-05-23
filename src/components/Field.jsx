export function Field({ label, value, onChange, placeholder, type = 'text',
                   multiline, rows = 3, hint, t }) {
  const base = {
    width: '100%', boxSizing: 'border-box', background: t.inputBg,
    border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 12px',
    fontSize: 14, color: t.text, outline: 'none', fontFamily: 'inherit',
    resize: 'none', transition: 'border-color 0.15s',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: t.textSub,
        letterSpacing: '0.03em' }}>{label}</label>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={rows} style={base}
            onFocus={e => e.target.style.borderColor = t.accent}
            onBlur={e  => e.target.style.borderColor = t.border} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={base}
            onFocus={e => e.target.style.borderColor = t.accent}
            onBlur={e  => e.target.style.borderColor = t.border} />}
      {hint && <span style={{ fontSize: 11, color: t.textMuted }}>{hint}</span>}
    </div>
  );
}