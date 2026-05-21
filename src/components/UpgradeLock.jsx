// components/UpgradeLock.jsx
import React from 'react';

export function UpgradeLock({ title, desc, t }) {
  
  const handleUpgradeClick = () => {
    const alertMessage = [
      '🚀 Career Pro Pack',
      '────────────────',
      '• Unlimited iterations & matches',
      '• Premium PDF & Word layout downloads',
      '• Tailored cover letter generator',
      '• Zero watermarks',
      '',
      '💰 Pricing Plans:',
      '• Basic Tier: ₹199',
      '• Pro Unlimited: ₹499',
      '',
      '💳 Google Play Billing — integration coming soon!'
    ].join('\n');
    
    alert(alertMessage);
  };

  return (
    <div 
      style={{ 
        background: t?.elevated || '#F1F5F9', 
        border: `1.5px dashed ${t?.borderSub || '#CBD5E1'}`, 
        borderRadius: 12, 
        padding: '24px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 12, 
        textAlign: 'center',
        boxSizing: 'border-box',
        width: '100%',
        marginTop: 12
      }}
    >
      {/* Centered Lock Icon Badge */}
      <div 
        style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          background: t?.accentBg || '#EFF6FF', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 18 
        }}
      >
        🔒
      </div>
      
      {/* Title & Description Context Blocks */}
      <div style={{ maxWidth: 320 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: t?.text || '#0F172A', margin: '0 0 4px' }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: t?.textSub || '#475569', margin: 0, lineHeight: 1.5 }}>
          {desc}
        </p>
      </div>
      
      {/* Action Conversion Trigger Button */}
      <button
        onClick={handleUpgradeClick}
        style={{ 
          background: t?.accent || '#2563EB', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 8, 
          padding: '9px 18px', 
          fontSize: 13, 
          fontWeight: 600, 
          cursor: 'pointer', 
          fontFamily: 'inherit',
          transition: 'background 0.15s ease-out'
        }}
        onMouseOver={e => e.currentTarget.style.background = t?.accentHov || '#1D4ED8'}
        onMouseOut={e => e.currentTarget.style.background = t?.accent || '#2563EB'}
      >
        Upgrade — ₹199 / ₹499
      </button>
    </div>
  );
}