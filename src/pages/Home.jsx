import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../utils/products';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#fffdf7',
        border: '1px solid var(--parchment-border)',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ position: 'relative', overflow: 'hidden', height: '220px' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'; }}
          />
          {product.badge && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'var(--indigo)',
              color: 'var(--gold)',
              fontSize: '10px',
              padding: '3px 8px',
              letterSpacing: '1px',
              fontFamily: "'Crimson Text', serif",
              fontStyle: 'italic',
            }}>
              {product.badge}
            </div>
          )}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'var(--gulaal)',
            color: 'white',
            fontSize: '10px',
            padding: '3px 8px',
            letterSpacing: '1px',
            fontFamily: 'sans-serif',
          }}>
            -{discount}%
          </div>
          {product.stock <= 5 && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(139,32,32,0.9)',
              color: 'white',
              fontSize: '10px',
              padding: '3px 8px',
              letterSpacing: '1px',
            }}>
              Only {product.stock} left
            </div>
          )}
        </div>

        <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: "'Yatra One', serif", fontSize: '15px', color: 'var(--indigo)', marginBottom: '2px' }}>
            {product.name}
          </div>
          <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '12px', color: 'var(--gold)', marginBottom: '8px' }}>
            {product.hindi}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic', marginBottom: '12px', flex: 1, lineHeight: '1.4' }}>
            {product.description.slice(0, 80)}...
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span style={{ fontFamily: "'Yatra One', serif", fontSize: '18px', color: 'var(--indigo)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)', textDecoration: 'line-through', marginLeft: '8px' }}>
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            style={{
              background: added ? 'var(--mehendi)' : 'var(--indigo)',
              color: 'var(--gold)',
              border: '1px solid var(--gold)',
              padding: '8px',
              fontFamily: "'Yatra One', serif",
              fontSize: '12px',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
            }}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart · कार्ट में डालें'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.hindi.includes(search);
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 48px' }}>
      <div style={{ textAlign: 'center', padding: '32px 0 24px', borderBottom: '1px solid var(--parchment-border)', marginBottom: '28px' }}>
        <div style={{ color: 'var(--gold)', letterSpacing: '8px', fontSize: '14px' }}>❧ ✦ ❧</div>
        <h1 style={{ fontFamily: "'Yatra One', serif", fontSize: '36px', color: 'var(--indigo)', marginTop: '8px' }}>
          The Grand Bazaar
        </h1>
        <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", color: 'var(--gold)', fontSize: '20px', marginTop: '4px' }}>
          महा बाज़ार
        </div>
        <p style={{ fontSize: '14px', color: 'var(--ink-muted)', fontStyle: 'italic', letterSpacing: '2px', marginTop: '8px' }}>
          finest indian textiles · handcrafted with love
        </p>
        <div style={{ color: 'var(--gold)', letterSpacing: '8px', fontSize: '14px', marginTop: '8px' }}>— ✦ —</div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 14px',
            background: '#fffdf7',
            border: '1px solid var(--parchment-border)',
            fontFamily: "'Crimson Text', serif",
            fontSize: '15px',
            color: 'var(--ink)',
            outline: 'none',
          }}
          placeholder="Search items · वस्तु खोजें..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '6px 16px',
              background: activeCategory === cat.id ? 'var(--indigo)' : '#fffdf7',
              color: activeCategory === cat.id ? 'var(--gold)' : 'var(--ink-muted)',
              border: '1px solid var(--parchment-border)',
              cursor: 'pointer',
              fontFamily: "'Crimson Text', serif",
              fontSize: '13px',
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
          >
            {cat.label} · {cat.hindi}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          No items found in the bazaar for your search.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
