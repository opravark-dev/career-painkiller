export function Badge({ children, color = 'blue', t }) {
  const map = {
    blue:  { bg: t.accentBg, text: t.accentText },
    green: { bg: t.greenBg,  text: t.greenText  },
    amber: { bg: t.amberBg,  text: t.amberText  },
    red:   { bg: t.redBg,    text: t.redText    },
  };
  const c = map[color] || map.blue;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px',
      borderRadius: 99, background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}