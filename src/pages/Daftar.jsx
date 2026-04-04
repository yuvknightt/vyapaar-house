import { useOrders } from '../hooks/useOrders';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Daftar() {
  const { orders, loading } = useOrders();

  const confirmed = orders.filter(o => o.status === 'CONFIRMED').length;
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const failed = orders.filter(o => o.status === 'FAILED').length;
  const recent = [...orders].reverse().slice(0, 5);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="The Grand Daftar"
        hindi="महा दफ्तर"
        subtitle="the complete order ledger · सम्पूर्ण व्यापार विवरण"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '14px', marginBottom: '28px' }}>
        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--gold)' }}>{loading ? '—' : orders.length}</div>
          <div className="stat-label">Kul Hukum</div>
          <div className="stat-hindi">कुल हुक्म</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--mehendi)' }}>{loading ? '—' : confirmed}</div>
          <div className="stat-label">Sweekar</div>
          <div className="stat-hindi">स्वीकार</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--haldi)' }}>{loading ? '—' : pending}</div>
          <div className="stat-label">Prateeksha</div>
          <div className="stat-hindi">प्रतीक्षा</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--gulaal)' }}>{loading ? '—' : failed}</div>
          <div className="stat-label">Akrit</div>
          <div className="stat-hindi">अकृत</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: '20px' }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent Dispatches</span>
            <span className="panel-sub">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4a7a4a', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }}></span>
              live · हाल के आदेश
            </span>
          </div>
          <div className="panel-body">
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                Consulting the ledger...
              </div>
            ) : recent.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                No orders yet. Place your first hukum.
              </div>
            ) : (
              <table className="vt-table">
                <thead>
                  <tr>
                    <th>Hukum No.</th>
                    <th>Vastu</th>
                    <th>Matra</th>
                    <th>Sthiti</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(order => (
                    <tr key={order.id}>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>#{order.id}</td>
                      <td>Product {order.productId}</td>
                      <td>{order.qty}</td>
                      <td><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Quick Aadesh</span>
              <span className="panel-sub">शीघ्र आदेश</span>
            </div>
            <div className="panel-body" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ color: 'var(--ink-muted)', fontStyle: 'italic', fontSize: '14px', marginBottom: '12px' }}>
                Issue a new trade requisition to the house
              </div>
              <Link to="/dispatch">
                <button className="vt-btn">Issue New Hukum →</button>
              </Link>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">House Stats</span>
              <span className="panel-sub">व्यापार सांख्यिकी</span>
            </div>
            <div className="panel-body" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e8dcc8' }}>
                <span style={{ fontSize: '13px', color: 'var(--ink-muted)', letterSpacing: '1px' }}>Success Rate</span>
                <span style={{ fontFamily: "'Yatra One', serif", color: 'var(--mehendi)', fontSize: '18px' }}>
                  {orders.length > 0 ? Math.round((confirmed / orders.length) * 100) : 0}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e8dcc8' }}>
                <span style={{ fontSize: '13px', color: 'var(--ink-muted)', letterSpacing: '1px' }}>Awaiting</span>
                <span style={{ fontFamily: "'Yatra One', serif", color: 'var(--haldi)', fontSize: '18px' }}>{pending}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: 'var(--ink-muted)', letterSpacing: '1px' }}>System</span>
                <span style={{ fontSize: '12px', color: 'var(--mehendi)', fontStyle: 'italic' }}>● Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
