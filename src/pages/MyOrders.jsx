import { useLocation } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useAuthContext } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

function TrackingBar({ status }) {
  const steps = [
    { key: 'PLACED', label: 'Placed', hindi: 'आदेश दिया' },
    { key: 'CONFIRMED', label: 'Confirmed', hindi: 'स्वीकार' },
    { key: 'DISPATCHED', label: 'Dispatched', hindi: 'भेजा गया' },
  ];

  const currentIndex = status === 'FAILED' ? -1
    : status === 'CONFIRMED' ? 1
    : status === 'DISPATCHED' ? 2 : 0;

  if (status === 'FAILED') {
    return (
      <div style={{ fontSize: '12px', color: 'var(--gulaal)', fontStyle: 'italic', padding: '8px 0' }}>
        ✗ Order could not be processed · अकृत
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: i <= currentIndex ? 'var(--mehendi)' : 'var(--parchment-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: i <= currentIndex ? 'white' : 'var(--ink-muted)',
              fontSize: '12px', fontWeight: 'bold', transition: 'all 0.3s',
            }}>
              {i <= currentIndex ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: '10px', color: i <= currentIndex ? 'var(--mehendi)' : 'var(--ink-muted)', letterSpacing: '1px', textAlign: 'center' }}>
              {step.label}
            </div>
            <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '10px', color: 'var(--gold)' }}>
              {step.hindi}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: '2px', margin: '0 4px', marginBottom: '28px',
              background: i < currentIndex ? 'var(--mehendi)' : 'var(--parchment-border)',
              transition: 'all 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const { orders, loading } = useOrders(3000);
  const { user } = useAuthContext();
  const location = useLocation();
  const success = location.state?.success;
  const paymentId = location.state?.paymentId;

  const myOrders = orders
    .filter(o => o.customerEmail === user?.email)
    .reverse();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Mere Aadesh"
        hindi="मेरे आदेश"
        subtitle="your order history · आपके आदेशों का विवरण"
      />

      {success && (
        <div style={{
          marginBottom: '20px', padding: '16px 20px',
          background: '#e8f0e8', border: '1px solid var(--mehendi)',
          color: 'var(--mehendi)',
        }}>
          <div style={{ fontFamily: "'Yatra One', serif", fontSize: '16px', marginBottom: '4px' }}>
            ✦ Hukum placed successfully!
          </div>
          <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
            Payment ID: {paymentId} · Your order is being processed.
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          Consulting your records...
        </div>
      )}

      {!loading && myOrders.length === 0 && (
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">No Orders Yet</span>
          </div>
          <div className="panel-body" style={{ padding: '32px', textAlign: 'center' }}>
            <div className="ornament">❧ ✦ ❧</div>
            <p style={{ marginTop: '16px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              You have not placed any hukum yet. Visit the bazaar!
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {myOrders.map(order => (
          <div key={order.id} className="panel">
            <div className="panel-head">
              <span className="panel-title">Hukum #{order.id}</span>
              <span className="panel-sub">Product {order.productId} · Qty {order.qty}</span>
            </div>
            <div className="panel-body" style={{ padding: '16px 20px' }}>
              <TrackingBar status={order.status} />
              <div style={{ display: 'flex', gap: '24px', marginTop: '8px', fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                <span>Product ID: {order.productId}</span>
                <span>Qty: {order.qty}</span>
                <span>Status: {order.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
