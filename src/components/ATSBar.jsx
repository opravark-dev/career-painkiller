export function ATSBar({ score, label, t }) {
  const color = score >= 75 ? t.green : score >= 50 ? t.amber : t.red;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, color: t.textSub, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>
          {score}<span style={{ fontSize: 12, fontWeight: 400, color: t.textMuted }}>/100</span>
        </span>
      </div>
      <div style={{ background: t.border, borderRadius: 99, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color,
          borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}