import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { placeFullOrder } from '../utils/orderService';
import PageHeader from '../components/PageHeader';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: profile?.full_name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleRazorpay = async (e) => {
    e.preventDefault();
    setLoading(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: 'INR',
      name: 'Vyapaar House',
      description: `${items.length} item(s) from the bazaar`,
      prefill: {
        name: address.name,
        email: user.email,
        contact: address.phone,
      },
      theme: { color: '#1a1a3e' },
      handler: async (response) => {
        try {
          const order = await placeFullOrder({
            user,
            items,
            address,
            paymentId: response.razorpay_payment_id,
            total,
          });
          clearCart();
          navigate('/my-orders', {
            state: { success: true, orderId: order.id, paymentId: response.razorpay_payment_id }
          });
        } catch (err) {
          alert('Payment done but order save failed: ' + err.message);
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Bhugtan"
        hindi="भुगतान"
        subtitle="complete your purchase · खरीदारी पूरी करें"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: '24px' }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Delivery Address · पता</span>
          </div>
          <div className="panel-body" style={{ padding: '20px' }}>
            <form id="checkout-form" onSubmit={handleRazorpay}>
              {[
                { key: 'name', label: 'Full Name · पूरा नाम', placeholder: 'Your full name' },
                { key: 'phone', label: 'Phone · फोन', placeholder: '10-digit mobile number' },
                { key: 'street', label: 'Street Address · गली', placeholder: 'House no, street, locality' },
                { key: 'city', label: 'City · शहर', placeholder: 'City' },
                { key: 'state', label: 'State · राज्य', placeholder: 'State' },
                { key: 'pincode', label: 'Pincode · पिन', placeholder: '6-digit pincode' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '14px' }}>
                  <label className="vt-label">{field.label}</label>
                  <input
                    className="vt-input"
                    placeholder={field.placeholder}
                    value={address[field.key]}
                    onChange={e => setAddress({ ...address, [field.key]: e.target.value })}
                    required
                  />
                </div>
              ))}
            </form>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Order Summary · सारांश</span>
            </div>
            <div className="panel-body">
              {items.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', gap: '12px', padding: '12px 16px',
                  borderBottom: i < items.length - 1 ? '1px solid #e8dcc8' : 'none',
                  alignItems: 'center',
                }}>
                  <img src={item.image} alt={item.name}
                    style={{ width: '52px', height: '52px', objectFit: 'cover', border: '1px solid var(--parchment-border)' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontFamily: "'Yatra One', serif", color: 'var(--indigo)' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontFamily: "'Yatra One', serif", fontSize: '14px', color: 'var(--indigo)' }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-body" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--ink-muted)' }}>
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: 'var(--ink-muted)' }}>
                <span>Delivery · डाक</span>
                <span style={{ color: 'var(--mehendi)' }}>Free · मुफ्त</span>
              </div>
              <div style={{ height: '1px', background: 'var(--parchment-border)', marginBottom: '12px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontFamily: "'Yatra One', serif", fontSize: '18px' }}>Total · कुल</span>
                <span style={{ fontFamily: "'Yatra One', serif", fontSize: '24px', color: 'var(--indigo)' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
              <button form="checkout-form" type="submit" className="vt-btn" disabled={loading}>
                {loading ? 'Opening Payment...' : 'PAY WITH RAZORPAY · भुगतान करें'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                Secured by Razorpay · Test mode active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
