import React from 'react';
import { Btn } from './Btn';

export function UpgradeModal({ isOpen, onClose, t }) {
  if (!isOpen) return null;

  const features = [
    { name: 'ATS Optimization', free: '✓', pro: '✓' },
    { name: 'Optimized Resume', free: '✓', pro: '✓' },
    { name: 'Cover Letter Preview', free: '✓', pro: '✓' },
    { name: 'Remove Watermarks', free: '❌', pro: '✓' },
    { name: 'PDF/DOCX Export', free: '❌', pro: '✓' },
    { name: 'Unlimited Generations', free: '❌', pro: '✓' },
    { name: 'Priority AI Processing', free: '❌', pro: '✓' },
    { name: 'Pro Templates', free: '❌', pro: '✓' },
  ];

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
        maxWidth: 500,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16, right: 16,
            background: 'none',
            border: 'none',
            fontSize: 20,
            color: t.textMuted,
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <div style={{
          width: 48,
          height: 48,
          background: t.accent,
          color: '#fff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          margin: '0 auto 16px'
        }}>💎</div>

        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: t.text }}>
          Upgrade to ResumeAI Pro
        </h2>
        <p style={{ fontSize: 14, color: t.textSub, marginBottom: 24, lineHeight: 1.5 }}>
          Get professional-grade documents that get you noticed by top recruiters.
        </p>

        <div style={{
          width: '100%',
          overflowX: 'auto',
          marginBottom: 24
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            textAlign: 'left',
            color: t.text
          }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${t.border}` }}>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Feature</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>Free</th>
                <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center', color: t.accent }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={{ padding: '12px 8px', color: t.textSub }}>{f.name}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>{f.free}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: f.pro === '✓' ? t.green : t.text }}>{f.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Btn t={t} onClick={() => alert('Redirecting to secure payment gateway...')} style={{ fontSize: 16, padding: '14px' }}>
            Unlock Pro Lifetime — ₹499
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
            Continue with Free version
          </button>
        </div>
      </div>
    </div>
  );
}
