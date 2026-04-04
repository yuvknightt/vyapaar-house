export default function PageHeader({ title, hindi, subtitle }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '24px 0 16px',
      borderBottom: '1px solid var(--parchment-border)',
      marginBottom: '24px',
    }}>
      <div className="ornament">❧ ✦ ❧</div>
      <h1 style={{ fontSize: '32px', color: 'var(--indigo)', marginTop: '8px' }}>
        {title}
      </h1>
      {hindi && (
        <div style={{
          fontFamily: "'Tiro Devanagari Hindi', serif",
          color: 'var(--gold)',
          fontSize: '18px',
          marginTop: '4px',
        }}>{hindi}</div>
      )}
      {subtitle && (
        <div style={{
          fontSize: '13px',
          color: 'var(--ink-muted)',
          letterSpacing: '3px',
          fontStyle: 'italic',
          marginTop: '6px',
        }}>{subtitle}</div>
      )}
      <div className="ornament" style={{ marginTop: '8px' }}>— ✦ —</div>
    </div>
  );
}
