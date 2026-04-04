import { useOrders, useProducts } from '../hooks/useOrders';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

export default function Admin() {
  const { orders, loading } = useOrders(5000);
  const { products } = useProducts(5000);

  const confirmed = orders.filter(o => o.status === 'CONFIRMED').length;
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const uniqueCustomers = [...new Set(orders.map(o => o.customerEmail))].length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Admin Daftar"
        hindi="प्रशासन दफ्तर"
        subtitle="house management · व्यापार प्रबंधन"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { num: orders.length, label: 'Total Orders', hindi: 'कुल आदेश', color: 'var(--gold)' },
          { num: confirmed, label: 'Confirmed', hindi: 'स्वीकार', color: 'var(--mehendi)' },
          { num: pending, label: 'Pending', hindi: 'प्रतीक्षा', color: 'var(--haldi)' },
          { num: uniqueCustomers, label: 'Customers', hindi: 'व्यापारी', color: 'var(--indigo)' },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <div className="stat-num" style={{ color: s.color }}>{loading ? '—' : s.num}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-hindi">{s.hindi}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: '20px' }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">All Orders · सभी आदेश</span>
            <span className="panel-sub">{orders.length} total</span>
          </div>
          <div className="panel-body">
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic' }}>Loading...</div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="vt-table">
                  <thead>
                    <tr><th>#</th><th>Customer</th><th>Product</th><th>Qty</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {[...orders].reverse().map(order => (
                      <tr key={order.id}>
                        <td style={{ color: 'var(--gold)', fontFamily: "'Yatra One', serif" }}>#{order.id}</td>
                        <td style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{order.customerEmail.split('@')[0]}</td>
                        <td>P{order.productId}</td>
                        <td>{order.qty}</td>
                        <td><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Inventory · भंडार</span>
            <span className="panel-sub">live stock</span>
          </div>
          <div className="panel-body">
            {products.map((p, i) => (
              <div key={p.id} style={{
                padding: '12px 16px',
                borderBottom: i < products.length - 1 ? '1px solid #e8dcc8' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontFamily: "'Yatra One', serif", color: 'var(--indigo)' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '1px' }}>ID: {p.id}</div>
                </div>
                <div style={{
                  fontFamily: "'Yatra One', serif", fontSize: '20px',
                  color: p.stock <= 3 ? 'var(--gulaal)' : p.stock <= 10 ? 'var(--haldi)' : 'var(--mehendi)',
                }}>
                  {p.stock}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
