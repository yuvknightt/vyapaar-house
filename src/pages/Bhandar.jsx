import PageHeader from '../components/PageHeader';
import { useState, useEffect } from 'react';

const PRODUCTS = [
  { id: 101, name: 'Laptop Stand', hindi: 'लैपटॉप स्टैंड', max: 50 },
  { id: 102, name: 'Keyboard', hindi: 'कीबोर्ड', max: 20 },
  { id: 103, name: 'Monitor', hindi: 'मॉनिटर', max: 10 },
];

function StockBar({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const color = pct > 50 ? 'var(--mehendi)' : pct > 20 ? 'var(--haldi)' : 'var(--gulaal)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '8px', background: '#e8dcc8', border: '1px solid var(--parchment-border)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '13px', color: 'var(--ink-muted)', minWidth: '40px', textAlign: 'right', fontStyle: 'italic' }}>
        {pct}%
      </span>
    </div>
  );
}

export default function Bhandar() {
  const [stocks, setStocks] = useState({ 101: 50, 102: 20, 103: 10 });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Bhandar"
        hindi="भंडार"
        subtitle="the warehouse inventory · गोदाम की सूची"
      />

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Current Stock Levels</span>
          <span className="panel-sub">वर्तमान भंडार स्तर</span>
        </div>
        <div className="panel-body">
          {PRODUCTS.map((p, i) => (
            <div key={p.id} style={{
              padding: '20px 20px',
              borderBottom: i < PRODUCTS.length - 1 ? '1px solid #e8dcc8' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontFamily: "'Yatra One', serif", fontSize: '16px', color: 'var(--indigo)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '13px', color: 'var(--gold)', marginTop: '2px' }}>
                    {p.hindi}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Yatra One', serif", fontSize: '24px', color: 'var(--ink)' }}>
                    {stocks[p.id]}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '2px' }}>
                    of {p.max} units
                  </div>
                </div>
              </div>
              <StockBar value={stocks[p.id]} max={p.max} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <div className="ornament">— ✦ —</div>
        <p style={{ fontSize: '13px', color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '8px', letterSpacing: '1px' }}>
          Stock levels update automatically as orders are processed through the messaging house
        </p>
      </div>
    </div>
  );
}
