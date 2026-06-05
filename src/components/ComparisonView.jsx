import React, { useState } from 'react';
import { Btn } from './Btn';

export function ComparisonView({ original, optimized, t }) {
  const [view, setView] = useState('optimized'); // 'original' | 'optimized'

  const content = view === 'original' ? original : optimized;
  const isOptimized = view === 'optimized';

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      marginBottom: 20
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: t.elevated,
        borderBottom: `1px solid ${t.border}`
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {isOptimized ? 'Optimized Version' : 'Original Version'}
        </span>
        <div style={{ display: 'flex', background: t.border, borderRadius: 99, padding: 2 }}>
          <button
            onClick={() => setView('original')}
            style={{
              padding: '4px 10px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: view === 'original' ? t.surface : 'transparent',
              color: view === 'original' ? t.text : t.textMuted,
              boxShadow: view === 'original' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Original
          </button>
          <button
            onClick={() => setView('optimized')}
            style={{
              padding: '4px 10px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: view === 'optimized' ? t.surface : 'transparent',
              color: view === 'optimized' ? t.text : t.textMuted,
              boxShadow: view === 'optimized' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Optimized
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', position: 'relative' }}>
        <pre style={{
          fontSize: 12,
          lineHeight: 1.6,
          color: t.textSub,
          whiteSpace: 'pre-wrap',
          fontFamily: "'SF Mono','Fira Mono',monospace",
          margin: 0
        }}>
          {content}
        </pre>
        {isOptimized && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%) rotate(-30deg)',
            fontSize: 34,
            fontWeight: 800,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            color: t.bg, // This is a trick to make it barely visible or use rgba
            opacity: 0.03
          }}>
            RESUMEAI
          </div>
        )}
      </div>

      <div style={{
        padding: '12px 16px',
        background: isOptimized ? t.accentBg : 'transparent',
        borderTop: `1px solid ${t.border}`,
        fontSize: 12,
        color: isOptimized ? t.accentText : t.textMuted,
        textAlign: 'center',
        fontWeight: 500
      }}>
        {isOptimized
          ? '✨ This version is optimized for ATS parsers and recruitment algorithms.'
          : 'This is your original resume. Notice the missing keywords and layout gaps.'}
      </div>
    </div>
  );
}
