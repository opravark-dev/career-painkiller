export function SocialProof({ t }) {
  const testimonials = [
    {
      name: 'Sarah J.',
      role: 'Software Engineer',
      text: 'The ATS optimization is a game changer. I got 3x more interviews after using ResumeAI!',
      rating: '⭐️⭐️⭐️⭐️⭐️'
    },
    {
      name: 'David K.',
      role: 'Product Manager',
      text: 'Incredibly fast and accurate. The cover letter preview was exactly what I needed.',
      rating: '⭐️⭐️⭐️⭐️⭐️'
    },
    {
      name: 'Elena M.',
      role: 'Marketing Lead',
      text: 'Simple, intuitive, and actually works. Highly recommend for anyone job hunting.',
      rating: '⭐️⭐️⭐️⭐️⭐️'
    }
  ];

  return (
    <section style={{
      padding: '60px 20px',
      textAlign: 'center',
      background: t.bg,
      color: t.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 32,
      maxWidth: 1000,
      margin: '0 auto',
      animation: 'fadeIn 1s ease-out'
    }}>
      <div style={{
        background: t.accent,
        color: '#fff',
        padding: '6px 16px',
        borderRadius: 99,
        fontSize: 14,
        fontWeight: 600,
        marginBottom: -10
      }}>
        2,400+ resumes optimized
      </div>

      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
        Trusted by Job Seekers
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        width: '100%'
      }}>
        {testimonials.map((item, i) => (
          <div key={i} style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: '24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            animation: `fadeIn ${1 + i * 0.2}s ease-out forwards`,
            opacity: 0
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = t.border; }}
          >
            <div style={{ color: '#FBBF24', fontSize: 14 }}>{item.rating}</div>
            <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "{item.text}"
            </p>
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>{item.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
