import React from 'react';
import { Badge } from './Badge';

export function InsightPanel({ data, t }) {
  // Show keywords from the OPTIMIZED resume (Step D) — these are the ones
  // the candidate should now know about.
  const {
    optimizedFoundKeywords: foundKeywords = [],
    optimizedMissingKeywords: missingKeywords = [],
    feedback = []
  } = data || {};

  // Split missing keywords into "Critical" and "Nice to Have"
  const splitIndex = Math.ceil(missingKeywords.length / 2);
  const criticalSkills = missingKeywords.slice(0, splitIndex);
  const niceToHave = missingKeywords.slice(splitIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
      {/* Keyword Match Section */}
      <div style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: '20px'
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔑 Keyword Analysis</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: t.greenBg, borderRadius: 12, padding: '12px', border: `1px solid ${t.green}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: t.greenText, margin: '0 0 8px', textTransform: 'uppercase' }}>
              ✅ Found in Resume
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {foundKeywords.length > 0 ? foundKeywords.map(k => (
                <Badge key={k} color="green" t={t}>{k}</Badge>
              )) : <span style={{ fontSize: 12, color: t.textMuted }}>No matches found.</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: t.redBg, borderRadius: 12, padding: '12px', border: `1px solid ${t.red}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: t.redText, margin: '0 0 8px', textTransform: 'uppercase' }}>
                ❌ Missing Critical Skills
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {criticalSkills.length > 0 ? criticalSkills.map(k => (
                  <Badge key={k} color="red" t={t}>{k}</Badge>
                )) : <span style={{ fontSize: 12, color: t.textMuted }}>None! You're all set.</span>}
              </div>
            </div>

            <div style={{ background: t.amberBg, borderRadius: 12, padding: '12px', border: `1px solid ${t.amber}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: t.amberText, margin: '0 0 8px', textTransform: 'uppercase' }}>
                ⚠️ Recommended Additions
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {niceToHave.length > 0 ? niceToHave.map(k => (
                  <Badge key={k} color="amber" t={t}>{k}</Badge>
                )) : <span style={{ fontSize: 12, color: t.textMuted }}>No additional suggestions.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Wins Section */}
      <div style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: '20px'
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡ Quick Wins</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {feedback.length > 0 ? feedback.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 10,
              background: t.elevated,
              borderRadius: 10,
              padding: '10px 12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${t.accent}`,
                flexShrink: 0,
                marginTop: 2
              }} />
              <span style={{ fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>{f}</span>
            </div>
          )) : <p style={{ fontSize: 13, color: t.textMuted }}>No critical improvements suggested.</p>}
        </div>
      </div>
    </div>
  );
}
