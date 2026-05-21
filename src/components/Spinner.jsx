// components/Spinner.jsx
import React from 'react';

export function Spinner({ msg = 'Processing...', t }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        padding: '10px 14px', 
        background: t?.accentBg || '#EFF6FF', 
        borderRadius: 8, 
        marginTop: 12,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* CSS-Animated Pure Element Spinner */}
      <div 
        style={{ 
          width: 15, 
          height: 15, 
          border: `2.5px solid ${t?.accent || '#2563EB'}`, 
          borderTopColor: 'transparent', 
          borderRadius: '50%', 
          animation: 'spin 0.75s linear infinite', 
          flexShrink: 0 
        }} 
      />
      
      {/* Loading Message Text */}
      {msg && (
        <span 
          style={{ 
            fontSize: 13, 
            color: t?.accentText || '#1D4ED8', 
            fontWeight: 500 
          }}
        >
          {msg}
        </span>
      )}
    </div>
  );
}