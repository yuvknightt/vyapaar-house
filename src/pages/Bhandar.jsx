import PageHeader from '../components/PageHeader';
import { useProducts } from '../hooks/useOrders';

const HINDI_NAMES = {
  'Laptop Stand': 'लैपटॉप स्टैंड',
  'Keyboard': 'कीबोर्ड',
  'Monitor': 'मॉनिटर',
};

const MAX_STOCK = { 101: 50, 102: 20, 103: 10 };

function StockBar({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const color = pct > 50 ? 'var(--mehendi)' : pct > 20 ? 'var(--haldi)' : 'var(--gulaal)';
  const label = pct > 50 ? 'Sufficient · पर्याप्त' : pct > 20 ? 'Low · कम' : 'Critical · संकट';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '8px', background: '#e8dcc8', border: '1px solid var(--parchment-border)' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.5s' }} />
        </div>
        <span style={{ fontSize: '13px', color, minWidth: '40px', textAlign: 'right', fontStyle: 'italic', fontWeight: 600 }}>
          {pct}%
        </span>
      </div>
      <div style={{ fontSize: '11px', color, letterSpacing: '1px', marginTop: '3px', fontStyle: 'italic' }}>
        {label}
      </div>
    </div>
  );
}

export default function Bhandar() {
  const { products, loading, error } = useProducts(5000);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Bhandar"
        hindi="भंडार"
        subtitle="live warehouse inventory · जीवंत गोदाम सूची"
      />

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Current Stock Levels</span>
          <span className="panel-sub">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4a7a4a', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }}></span>
            live · updates every 5 seconds
          </span>
        </div>
        <div className="panel-body">
          {loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Consulting the warehouse records...
            </div>
          )}
          {error && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--gulaal)', fontStyle: 'italic' }}>
              The warehouse is unreachable · {error}
            </div>
          )}
          {!loading && !error && products.map((p, i) => (
            <div key={p.id} style={{
              padding: '20px',
              borderBottom: i < products.length - 1 ? '1px solid #e8dcc8' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: "'Yatra One', serif", fontSize: '17px', color: 'var(--indigo)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '13px', color: 'var(--gold)', marginTop: '2px' }}>
                    {HINDI_NAMES[p.name] || p.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '2px', marginTop: '4px' }}>
                    Article No. {p.id}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Yatra One', serif", fontSize: '32px', color: 'var(--ink)', lineHeight: 1 }}>
                    {p.stock}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '2px', marginTop: '4px' }}>
                    of {MAX_STOCK[p.id] || 50} units
                  </div>
                </div>
              </div>
              <StockBar value={p.stock} max={MAX_STOCK[p.id] || 50} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <div className="ornament">— ✦ —</div>
        <p style={{ fontSize: '13px', color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '8px', letterSpacing: '1px' }}>
          Stock levels decrease automatically as hukums are processed through the messaging house
        </p>
      </div>
    </div>
  );
}
