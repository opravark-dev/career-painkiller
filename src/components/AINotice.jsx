import React from 'react';

// Subtle AI-generated disclosure shown above AI-produced documents.
export function AINotice({ t }) {
  return (
    <div style={{
      background: t.elevated,
      border: `1px solid ${t.borderSub}`,
      borderRadius: 10,
      padding: '10px 14px',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10
    }}>
      <div style={{
        fontSize: 14, lineHeight: 1,
        marginTop: 1,
        flexShrink: 0
      }} aria-hidden="true">✨</div>
      <div style={{ fontSize: 11, lineHeight: 1.5, color: t.textSub }}>
        <span style={{ fontWeight: 700, color: t.text }}>AI Notice. </span>
        This document has been optimized by ResumeAI using Artificial Intelligence based on your uploaded resume and job description.
        Please review formatting, wording and factual accuracy before submitting to employers.
      </div>
    </div>
  );
}
