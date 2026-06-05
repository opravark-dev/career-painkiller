import { Btn } from './Btn';

export function Hero({ t }) {
  const scrollToWizard = () => {
    document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      padding: '80px 20px',
      textAlign: 'center',
      background: t.bg,
      color: t.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: 48,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        margin: 0,
        background: `linear-gradient(to bottom right, ${t.text}, ${t.textSub})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        maxWidth: 600
      }}>
        Stop rewriting your resume for every job application
      </h1>

      <p style={{
        fontSize: 20,
        color: t.textSub,
        lineHeight: 1.5,
        maxWidth: 600,
        margin: 0
      }}>
        Upload your resume. Paste the job description. Get an ATS-optimized version tailored to the role in under 30 seconds.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Btn t={t} onClick={scrollToWizard} style={{ fontSize: 18, padding: '14px 28px' }}>
          Optimize My Resume
        </Btn>
        <p style={{ fontSize: 14, color: t.textMuted, fontWeight: 500 }}>
          No signup required.
        </p>
      </div>
    </section>
  );
}
