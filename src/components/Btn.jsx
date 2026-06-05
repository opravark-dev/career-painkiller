export function Btn({ children, onClick, variant = 'primary', disabled, small, t, style }) {
  const styles = {
    primary:   { background: t.accent, color: '#fff', border: 'none' },
    secondary: { background: 'transparent', color: t.textSub, border: `1px solid ${t.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
        ...styles[variant],
        padding: small ? '7px 13px' : '11px 18px', borderRadius: 8,
        fontSize: small ? 12 : 14, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        width: variant === 'primary' && !small ? '100%' : 'auto',
        fontFamily: 'inherit',
        ...style,
      }}
      onMouseOver={e => { if (!disabled && variant === 'primary') e.target.style.background = t.accentHov; }}
      onMouseOut={e  => { if (variant === 'primary') e.target.style.background = t.accent; }}>
      {children}
    </button>
  );
}