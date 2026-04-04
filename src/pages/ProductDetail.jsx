import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../utils/searchService';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProductById(parseInt(id))
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
      Loading product details...
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
      Product not found in the bazaar.
    </div>
  );

  const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    addItem(product, qty);
    navigate('/cart');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 48px' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'transparent', border: 'none', color: 'var(--ink-muted)',
        cursor: 'pointer', fontFamily: "'Crimson Text', serif", fontSize: '14px',
        marginBottom: '20px', letterSpacing: '1px', fontStyle: 'italic',
      }}>
        ← Back to Bazaar
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '460px', objectFit: 'cover', border: '1px solid var(--parchment-border)' }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'; }}
          />
          {product.badge && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'var(--indigo)', color: 'var(--gold)',
              fontSize: '11px', padding: '4px 12px', letterSpacing: '2px',
              fontFamily: "'Crimson Text', serif", fontStyle: 'italic',
            }}>
              {product.badge}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="ornament" style={{ fontSize: '12px', letterSpacing: '4px' }}>❧ ✦ ❧</div>
            <h1 style={{ fontFamily: "'Yatra One', serif", fontSize: '28px', color: 'var(--indigo)', marginTop: '8px' }}>
              {product.name}
            </h1>
            <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", color: 'var(--gold)', fontSize: '18px', marginTop: '4px' }}>
              {product.hindi}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontFamily: "'Yatra One', serif", fontSize: '32px', color: 'var(--indigo)' }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '16px', color: 'var(--ink-muted)', textDecoration: 'line-through' }}>
              ₹{product.original_price?.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '13px', background: '#e8f0e8', color: 'var(--mehendi)', padding: '2px 8px', border: '1px solid var(--mehendi)' }}>
              {discount}% off
            </span>
          </div>

          <div style={{ height: '1px', background: 'var(--parchment-border)' }} />

          <p style={{ fontSize: '15px', color: 'var(--ink-light)', lineHeight: '1.7', fontStyle: 'italic' }}>
            {product.description}
          </p>

          <div style={{ height: '1px', background: 'var(--parchment-border)' }} />

          <div>
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Matra · मात्रा
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: '36px', height: '36px', background: 'var(--parchment)', border: '1px solid var(--parchment-border)', cursor: 'pointer', fontSize: '18px' }}>
                −
              </button>
              <span style={{ fontFamily: "'Yatra One', serif", fontSize: '20px', minWidth: '32px', textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                style={{ width: '36px', height: '36px', background: 'var(--parchment)', border: '1px solid var(--parchment-border)', cursor: 'pointer', fontSize: '18px' }}>
                +
              </button>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                {product.stock} available
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <button className="vt-btn" onClick={handleBuyNow}>
              BUY NOW · अभी खरीदें
            </button>
            <button onClick={handleAdd} style={{
              padding: '10px',
              background: added ? 'var(--mehendi)' : '#fffdf7',
              color: added ? 'white' : 'var(--indigo)',
              border: '1px solid var(--parchment-border)',
              fontFamily: "'Yatra One', serif",
              fontSize: '13px', letterSpacing: '1px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {added ? '✓ Added to Cart' : 'ADD TO CART · कार्ट में डालें'}
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic', letterSpacing: '1px' }}>
            ✦ Free delivery across India &nbsp;|&nbsp; ✦ Authentic handcrafted items
          </div>
        </div>
      </div>
    </div>
  );
}
