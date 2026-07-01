export function UpgradeLock({ title, desc, t }) {
  return (
    <div style={{ background: t.elevated, border: `1.5px dashed ${t.borderSub}`,
      borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 10, textAlign: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.accentBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16 }}>🔓</div>
      <div>
        <p style={{ fontWeight: 600, fontSize: 14, color: t.text, margin: '0 0 4px' }}>{title}</p>
        <p style={{ fontSize: 12, color: t.textSub, margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
      <button onClick={() => alert('ResumeAI Pro Pack\n\nUnlimited generations\nWatermark-free PDF/DOCX export\nCover letters\nPriority AI processing\n\n₹199 – Basic | ₹499 – Pro\n\nPayments coming soon')}
        style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: 8,
          padding: '9px 18px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit' }}>
        Upgrade — ₹199 / ₹499
      </button>
    </div>
  );
}
