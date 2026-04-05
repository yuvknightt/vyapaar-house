import { useEffect, useRef } from 'react';

export default function PageHeader({ title, hindi, subtitle }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add('animate-fadeUp');
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="page-header" style={{ opacity: 0 }}>
      <div className="ornament" style={{ marginBottom: '12px' }}>❧ ✦ ❧</div>
      <h1 className="gold-glow" style={{ fontSize: '42px', letterSpacing: '3px' }}>{title}</h1>
      {hindi && (
        <div className="devanagari" style={{ fontSize: '22px', color: 'var(--gold)', opacity: 0.7, marginTop: '6px' }}>
          {hindi}
        </div>
      )}
      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', letterSpacing: '4px', fontStyle: 'italic', marginTop: '10px' }}>
          {subtitle}
        </div>
      )}
      <div className="ornament" style={{ marginTop: '12px' }}>— ✦ —</div>
    </div>
  );
}
