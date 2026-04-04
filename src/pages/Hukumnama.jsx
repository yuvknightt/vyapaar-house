import { useOrders } from '../hooks/useOrders';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

export default function Hukumnama() {
  const { orders, loading, error } = useOrders(3000);
  const sorted = [...orders].reverse();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Hukumnama"
        hindi="हुक्मनामा"
        subtitle="the complete order register · सभी व्यापार आदेश"
      />

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">All Orders</span>
          <span className="panel-sub">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4a7a4a', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }}></span>
            polling every 3 seconds · {orders.length} entries
          </span>
        </div>
        <div className="panel-body">
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Consulting the grand ledger...
            </div>
          )}
          {error && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gulaal)', fontStyle: 'italic' }}>
              The ledger is unavailable · {error}
            </div>
          )}
          {!loading && !error && sorted.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              The ledger is empty. No hukum has been issued yet.
            </div>
          )}
          {!loading && sorted.length > 0 && (
            <table className="vt-table">
              <thead>
                <tr>
                  <th>Hukum No.</th>
                  <th>Vastu (Product)</th>
                  <th>Matra (Qty)</th>
                  <th>Vyapaari (Email)</th>
                  <th>Sthiti (Status)</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(order => (
                  <tr key={order.id}>
                    <td style={{ color: 'var(--gold)', fontWeight: 600, fontFamily: "'Yatra One', serif" }}>
                      #{order.id}
                    </td>
                    <td>Product {order.productId}</td>
                    <td>{order.qty}</td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: '13px' }}>{order.customerEmail}</td>
                    <td><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
