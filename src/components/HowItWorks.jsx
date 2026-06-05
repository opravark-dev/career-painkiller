import { Badge } from './Badge';

export function HowItWorks({ t }) {
  const steps = [
    {
      title: 'Upload Resume',
      desc: 'Import your current resume in PDF or TXT format. Our AI analyzes your experience.',
      icon: '📄'
    },
    {
      title: 'Paste Job Description',
      desc: 'Provide the job role you are targeting. We match your skills to the exact requirements.',
      icon: '📋'
    },
    {
      title: 'Download Optimized Resume',
      desc: 'Get a tailored, ATS-friendly resume and cover letter ready to send to recruiters.',
      icon: '🚀'
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
      margin: '0 auto'
    }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
        How it Works
      </h2>
      <p style={{ fontSize: 16, color: t.textSub, maxWidth: 500, marginBottom: 20 }}>
        Three simple steps to transform your resume into a job-winning document.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        width: '100%'
      }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            transition: 'transform 0.2s, border-color 0.2s',
            cursor: 'default'
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{
              width: 64,
              height: 64,
              background: t.accentBg,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32
            }}>
              {s.icon}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{s.title}</h3>
            <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.6, margin: 0 }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
