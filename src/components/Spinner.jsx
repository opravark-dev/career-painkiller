export function Spinner({ msg, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', background: t.accentBg, borderRadius: 8, marginTop: 12 }}>
      <div style={{ width: 15, height: 15, border: `2.5px solid ${t.accent}`,
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.75s linear infinite', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: t.accentText, fontWeight: 500 }}>{msg}</span>
    </div>
  );
}