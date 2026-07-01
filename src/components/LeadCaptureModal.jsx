import React, { useState, useEffect } from 'react';
import { Btn } from './Btn';

export function LeadCaptureModal({ isOpen, onClose, onComplete, t, score }) {
  // Reset state every time the modal is opened so a previous submission
  // never leaks its email/consent/name into the next one.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setConsent(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail || !consent) return;
    setLoading(true);

    const trimmedName = (name || '').trim();
    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      consent: true,
      score: typeof score === 'number' ? score : 0,
      timestamp: new Date().toISOString()
    };
    console.log('[LeadCapture] Submitting payload:', payload);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      console.log('[LeadCapture] /api/leads raw response:', raw);

      let parsed = null;
      try { parsed = JSON.parse(raw); } catch {}
      if (!res.ok || (parsed && parsed.success === false)) {
        throw new Error(parsed?.error || `Lead endpoint returned ${res.status}`);
      }
      onComplete(trimmedEmail, trimmedName);
    } catch (e) {
      console.error('[LeadCapture] error:', e);
      // We still complete the flow so the user can download their resume.
      onComplete(trimmedEmail, trimmedName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div className="modal-panel" style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 24,
        padding: '32px',
        maxWidth: 400,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{
          width: 48,
          height: 48,
          background: t.accentBg,
          color: t.accent,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          margin: '0 auto 16px'
        }}>🎁</div>

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: t.text }}>
          Unlock Your Optimized Resume
        </h2>
        <p style={{ fontSize: 14, color: t.textSub, marginBottom: 24, lineHeight: 1.5 }}>
          Enter your email to download your final report and get a free guide on landing more interviews.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.elevated,
                color: t.text,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = t.accent}
              onBlur={e => e.target.style.borderColor = t.border}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.elevated,
                color: t.text,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = t.accent}
              onBlur={e => e.target.style.borderColor = t.border}
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 12,
            color: t.textMuted,
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              style={{ width: 14, height: 14 }}
            />
            I agree to receive career tips and a free resume guide.
          </label>

          <Btn
            t={t}
            disabled={!email.trim() || !consent || loading}
            onClick={handleSubmit}
          >
            {loading ? 'Processing...' : 'Get My Resume →'}
          </Btn>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: t.textMuted,
              fontSize: 12,
              cursor: 'pointer',
              padding: '8px',
              fontFamily: 'inherit'
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
