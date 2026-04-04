import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/PageHeader';

export default function Cart() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 48px' }}>
        <PageHeader title="Thela" hindi="थेला" subtitle="your shopping cart · खरीदारी की टोकरी" />
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          <div className="ornament">❧ ✦ ❧</div>
          <p style={{ marginTop: '16px', fontSize: '16px' }}>Your thela is empty · थेला खाली है</p>
          <Link to="/">
            <button className="vt-btn" style={{ maxWidth: '200px', margin: '20px auto 0' }}>
              Visit Bazaar →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader title="Thela" hindi="थेला" subtitle="your shopping cart · खरीदारी की टोकरी" />

      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-head">
          <span className="panel-title">Items in Cart · {items.length} vastu</span>
          <button onClick={clearCart} style={{
            background: 'transparent', border: '1px solid var(--gulaal)',
            color: 'var(--gulaal)', padding: '3px 10px', cursor: 'pointer',
            fontFamily: "'Crimson Text', serif", fontSize: '12px',
          }}>
            Clear All
          </button>
        </div>
        <div className="panel-body">
          {items.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', gap: '16px', padding: '16px',
              borderBottom: i < items.length - 1 ? '1px solid #e8dcc8' : 'none',
              alignItems: 'center',
            }}>
              <img src={item.image} alt={item.name}
                style={{ width: '70px', height: '70px', objectFit: 'cover', border: '1px solid var(--parchment-border)' }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Yatra One', serif", fontSize: '15px', color: 'var(--indigo)' }}>{item.name}</div>
                <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '12px', color: 'var(--gold)' }}>{item.hindi}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  ₹{item.price.toLocaleString('en-IN')} each
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQty(item.id, item.qty - 1)}
                  style={{ width: '28px', height: '28px', background: 'var(--parchment)', border: '1px solid var(--parchment-border)', cursor: 'pointer', fontSize: '16px' }}>
                  −
                </button>
                <span style={{ fontFamily: "'Yatra One', serif", fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)}
                  disabled={item.qty >= item.stock}
                  style={{ width: '28px', height: '28px', background: 'var(--parchment)', border: '1px solid var(--parchment-border)', cursor: 'pointer', fontSize: '16px' }}>
                  +
                </button>
              </div>
              <div style={{ fontFamily: "'Yatra One', serif", fontSize: '17px', color: 'var(--indigo)', minWidth: '80px', textAlign: 'right' }}>
                ₹{(item.price * item.qty).toLocaleString('en-IN')}
              </div>
              <button onClick={() => removeItem(item.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--gulaal)', cursor: 'pointer', fontSize: '18px' }}>
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Order Summary · कुल हिसाब</span>
        </div>
        <div className="panel-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--ink-muted)' }}>
            <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--ink-muted)' }}>
            <span>Delivery · डाक</span>
            <span style={{ color: 'var(--mehendi)' }}>Free</span>
          </div>
          <div style={{ height: '1px', background: 'var(--parchment-border)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontFamily: "'Yatra One', serif", fontSize: '18px' }}>Total · कुल</span>
            <span style={{ fontFamily: "'Yatra One', serif", fontSize: '22px', color: 'var(--indigo)' }}>
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
          <button className="vt-btn" onClick={() => navigate('/checkout')}>
            PROCEED TO CHECKOUT · भुगतान करें
          </button>
        </div>
      </div>
    </div>
  );
}
