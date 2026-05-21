// components/Btn.jsx
import React from 'react';

export function Btn({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled, 
  small, 
  t 
}) {
  
  const styles = {
    primary: { 
      background: t?.accent || '#2563eb', 
      color: '#fff', 
      border: 'none' 
    },
    secondary: { 
      background: 'transparent', 
      color: t?.textSub || '#475569', 
      border: `1px solid ${t?.border || '#e2e8f0'}` 
    },
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{
        ...styles[variant], 
        padding: small ? '7px 13px' : '11px 18px', 
        borderRadius: 8,
        fontSize: small ? 12 : 14, 
        fontWeight: 600, 
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, 
        transition: 'all 0.15s',
        width: variant === 'primary' && !small ? '100%' : 'auto', 
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }}
      onMouseOver={e => { 
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.background = t?.accentHov || '#1d4ed8'; 
        }
      }}
      onMouseOut={e => { 
        if (variant === 'primary') {
          e.currentTarget.style.background = t?.accent || '#2563eb'; 
        }
      }}
    >
      {children}
    </button>
  );
}