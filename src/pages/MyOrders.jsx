import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getMyOrders } from '../utils/orderService';
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
      <div style={{ padding: '10px 14px', background: '#f5e8e8', border: '1px solid var(--gulaal)', color: 'var(--gulaal)', fontSize: '13px', fontStyle: 'italic' }}>
        ✗ Order could not be processed · अकृत
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', margin: '8px 0' }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: i <= currentIndex ? 'var(--mehendi)' : '#e8dcc8',
              border: i === currentIndex ? '2px solid var(--gold)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: i <= currentIndex ? 'white' : 'var(--ink-muted)',
              fontSize: '13px', fontWeight: 'bold', transition: 'all 0.4s',
            }}>
              {i <= currentIndex ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: '11px', color: i <= currentIndex ? 'var(--mehendi)' : 'var(--ink-muted)', letterSpacing: '1px', textAlign: 'center' }}>
              {step.label}
            </div>
            <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '11px', color: i <= currentIndex ? 'var(--gold)' : '#c9b99a' }}>
              {step.hindi}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: '3px', margin: '0 6px', marginBottom: '40px',
              background: i < currentIndex ? 'var(--mehendi)' : '#e8dcc8',
              transition: 'all 0.4s', borderRadius: '2px',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onClick }) {
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const time = new Date(order.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  const statusColor = {
    PLACED: 'var(--haldi)', CONFIRMED: 'var(--mehendi)',
    DISPATCHED: '#534AB7', FAILED: 'var(--gulaal)',
  }[order.status] || 'var(--haldi)';

  return (
    <div className="panel" style={{ cursor: 'pointer' }} onClick={() => onClick(order)}>
      <div className="panel-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="panel-title">Order · {order.id.slice(0, 8).toUpperCase()}</span>
          <span style={{
            fontSize: '11px', padding: '2px 10px', letterSpacing: '1px',
            border: `1px solid ${statusColor}`, color: statusColor,
            fontStyle: 'italic', fontFamily: "'Crimson Text', serif",
          }}>
            {order.status}
          </span>
        </div>
        <span className="panel-sub">{date} · {time}</span>
      </div>
      <div className="panel-body" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {order.items?.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '200px' }}>
              <img src={item.image} alt={item.name}
                style={{ width: '56px', height: '56px', objectFit: 'cover', border: '1px solid var(--parchment-border)', flexShrink: 0 }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'; }}
              />
              <div>
                <div style={{ fontFamily: "'Yatra One', serif", fontSize: '14px', color: 'var(--indigo)' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Qty: {item.qty} · ₹{item.subtotal?.toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
          {order.items?.length > 3 && (
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic', alignSelf: 'center' }}>
              +{order.items.length - 3} more items
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e8dcc8', paddingTop: '14px' }}>
          <TrackingBar status={order.status} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8dcc8' }}>
          <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            Payment: <span style={{ color: 'var(--mehendi)' }}>✓ {order.payment_status}</span>
            {order.payment_id && <span> · {order.payment_id}</span>}
          </div>
          <div style={{ fontFamily: "'Yatra One', serif", fontSize: '18px', color: 'var(--indigo)' }}>
            ₹{order.total_amount?.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--gold)', fontStyle: 'italic', letterSpacing: '1px' }}>
            Click to view full details →
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,62,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--parchment)', maxWidth: '700px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        border: '2px solid var(--gold)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          background: 'var(--indigo)', padding: '16px 20px',
          borderBottom: '2px solid var(--gold)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: "'Yatra One', serif", color: 'var(--gold)', fontSize: '16px' }}>
              Order Details · आदेश विवरण
            </div>
            <div style={{ fontSize: '11px', color: '#8a7a9a', marginTop: '2px', letterSpacing: '1px' }}>
              {order.id}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid #8a7a9a',
            color: '#8a7a9a', cursor: 'pointer', fontSize: '18px',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Order Date', value: date },
              { label: 'Payment ID', value: order.payment_id || 'N/A' },
              { label: 'Payment Status', value: order.payment_status, color: 'var(--mehendi)' },
              { label: 'Order Status', value: order.status, color: 'var(--haldi)' },
              { label: 'Total Amount', value: `₹${order.total_amount?.toLocaleString('en-IN')}`, big: true },
              { label: 'Items Count', value: `${order.items?.length || 0} item(s)` },
            ].map(item => (
              <div key={item.label} style={{
                background: '#fffdf7', padding: '12px 14px',
                border: '1px solid var(--parchment-border)',
              }}>
                <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: item.big ? "'Yatra One', serif" : "'Crimson Text', serif",
                  fontSize: item.big ? '20px' : '14px',
                  color: item.color || 'var(--ink)',
                  wordBreak: 'break-all',
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Items Ordered · वस्तुएं
            </div>
            {order.items?.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '14px', padding: '12px 0',
                borderBottom: i < order.items.length - 1 ? '1px solid #e8dcc8' : 'none',
                alignItems: 'center',
              }}>
                <img src={item.image} alt={item.name}
                  style={{ width: '64px', height: '64px', objectFit: 'cover', border: '1px solid var(--parchment-border)' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Yatra One', serif", fontSize: '15px', color: 'var(--indigo)' }}>{item.name}</div>
                  <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '12px', color: 'var(--gold)' }}>{item.hindi}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    ₹{item.price?.toLocaleString('en-IN')} × {item.qty}
                  </div>
                </div>
                <div style={{ fontFamily: "'Yatra One', serif", fontSize: '16px', color: 'var(--indigo)' }}>
                  ₹{item.subtotal?.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {order.address && (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Delivery Address · पता
              </div>
              <div style={{ background: '#fffdf7', padding: '14px 16px', border: '1px solid var(--parchment-border)', fontSize: '14px', lineHeight: '1.8', color: 'var(--ink)' }}>
                <div style={{ fontFamily: "'Yatra One', serif", fontSize: '15px', marginBottom: '4px' }}>{order.address.name}</div>
                <div>{order.address.phone}</div>
                <div>{order.address.street}</div>
                <div>{order.address.city}, {order.address.state} - {order.address.pincode}</div>
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Order Tracking · आदेश ट्रैकिंग
            </div>
            <TrackingBar status={order.status} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function MyOrders() {
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const success = location.state?.success;
  const paymentId = location.state?.paymentId;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const data = await getMyOrders(user.id);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Mere Aadesh"
        hindi="मेरे आदेश"
        subtitle="your order history · आपके आदेशों का विवरण"
      />

      {success && (
        <div style={{ marginBottom: '24px', padding: '16px 20px', background: '#e8f0e8', border: '1px solid var(--mehendi)', color: 'var(--mehendi)' }}>
          <div style={{ fontFamily: "'Yatra One', serif", fontSize: '16px', marginBottom: '4px' }}>
            ✦ Hukum placed successfully!
          </div>
          <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
            Payment ID: {paymentId} · Your order is being processed by the house.
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          Consulting your records...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="panel">
          <div className="panel-head"><span className="panel-title">No Orders Yet</span></div>
          <div className="panel-body" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="ornament">❧ ✦ ❧</div>
            <p style={{ marginTop: '16px', color: 'var(--ink-muted)', fontStyle: 'italic', fontSize: '15px' }}>
              You have not placed any hukum yet. Visit the bazaar!
            </p>
            <button className="vt-btn" style={{ maxWidth: '200px', margin: '16px auto 0' }}
              onClick={() => navigate('/')}>
              Visit Bazaar →
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map(order => (
          <OrderCard key={order.id} order={order} onClick={setSelectedOrder} />
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
