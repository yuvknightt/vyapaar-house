import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../utils/searchService';
import { CATEGORIES } from '../utils/products';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function Hero() {
  const heroRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const handleMouse = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5);
      const y = (e.clientY / h - 0.5);
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${x * 60}px, ${y * 40}px)`;
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${-x * 80}px, ${-y * 50}px)`;
      if (orb3Ref.current) orb3Ref.current.style.transform = `translate(${x * 30}px, ${y * 70}px)`;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div ref={heroRef} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', background: 'var(--bg)',
    }}>
      <div ref={orb1Ref} style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)',
        top: '-10%', left: '-10%', transition: 'transform 0.3s ease', pointerEvents: 'none',
      }} />
      <div ref={orb2Ref} style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,32,32,0.12) 0%, transparent 70%)',
        bottom: '5%', right: '5%', transition: 'transform 0.3s ease', pointerEvents: 'none',
      }} />
      <div ref={orb3Ref} style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,106,79,0.1) 0%, transparent 70%)',
        top: '40%', left: '50%', transition: 'transform 0.3s ease', pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(212,160,23,0.02) 80px, rgba(212,160,23,0.02) 81px), repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(212,160,23,0.02) 80px, rgba(212,160,23,0.02) 81px)`,
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, padding: '0 24px' }}>
        <div className="devanagari" style={{
          fontSize: '14px', letterSpacing: '8px', color: 'var(--ink-muted)',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease', marginBottom: '16px',
        }}>
          व्यापार भवन · since MMXXVI
        </div>

        <div style={{
          fontFamily: "'Yatra One',serif",
          fontSize: 'clamp(56px, 10vw, 120px)',
          color: 'var(--gold)',
          lineHeight: 1,
          letterSpacing: '4px',
          opacity: visible ? 1 : 0,
          clipPath: visible ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: 'all 1s ease 0.2s',
          textShadow: '0 0 80px rgba(212,160,23,0.3)',
        }}>
          VYAPAAR
        </div>
        <div style={{
          fontFamily: "'Yatra One',serif",
          fontSize: 'clamp(56px, 10vw, 120px)',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(212,160,23,0.6)',
          lineHeight: 1,
          letterSpacing: '4px',
          opacity: visible ? 1 : 0,
          clipPath: visible ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: 'all 1s ease 0.4s',
        }}>
          HOUSE
        </div>

        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, var(--gold), transparent)',
          maxWidth: '400px', margin: '24px auto',
          opacity: visible ? 0.6 : 0,
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'all 0.8s ease 0.8s',
        }} />

        <p style={{
          fontSize: '13px', letterSpacing: '5px', color: 'var(--ink-muted)',
          fontStyle: 'italic', marginBottom: '40px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease 1s',
        }}>
          finest indian textiles · handcrafted with love
        </p>

        <div style={{
          display: 'flex', gap: '16px', justifyContent: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease 1.2s',
        }}>
          <Link to="#bazaar" style={{ textDecoration: 'none' }}>
            <button className="vt-btn" style={{ width: 'auto', padding: '12px 32px' }}
              onClick={() => document.getElementById('bazaar')?.scrollIntoView({ behavior: 'smooth' })}>
              ENTER THE BAZAAR
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'transparent', border: '1px solid var(--border-md)',
              color: 'var(--ink-muted)', padding: '12px 32px',
              fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '2px',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border-md)'; e.target.style.color = 'var(--ink-muted)'; }}
            >
              SIGN IN
            </button>
          </Link>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 1.6s',
        animation: 'fadeUpDown 2s ease-in-out infinite',
      }}>
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, var(--gold))' }} />
        <div style={{ fontSize: '9px', letterSpacing: '4px', color: 'var(--ink-muted)' }}>SCROLL</div>
      </div>

      <style>{`
        @keyframes fadeUpDown {
          0%,100% { opacity:0.4; transform:translateX(-50%) translateY(0); }
          50% { opacity:1; transform:translateX(-50%) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

function Marquee() {
  const items = ['SAREES', '✦', 'SUITS', '✦', 'JEWELLERY', '✦', 'SANDALS', '✦', 'PURSES', '✦'];
  const hindiItems = ['साड़ियाँ', '◆', 'सूट', '◆', 'आभूषण', '◆', 'चप्पल', '◆', 'पर्स', '◆'];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', padding: '0' }}>
      <div style={{ display: 'flex', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', gap: '40px', whiteSpace: 'nowrap', padding: '14px 0',
          animation: 'marqueeLeft 20s linear infinite',
        }}>
          {[...items, ...items, ...items].map((item, i) => (
            <span key={i} style={{
              fontFamily: item === '✦' ? 'serif' : "'Cinzel',serif",
              fontSize: item === '✦' ? '16px' : '13px',
              letterSpacing: '4px',
              color: item === '✦' ? 'var(--gold)' : 'var(--ink-muted)',
            }}>{item}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', gap: '40px', whiteSpace: 'nowrap', padding: '14px 0',
          animation: 'marqueeRight 15s linear infinite',
        }}>
          {[...hindiItems, ...hindiItems, ...hindiItems].map((item, i) => (
            <span key={i} className="devanagari" style={{
              fontSize: item === '◆' ? '12px' : '15px',
              letterSpacing: '2px',
              color: item === '◆' ? 'var(--gold)' : 'var(--ink-muted)',
            }}>{item}</span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marqueeLeft { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        @keyframes marqueeRight { from{transform:translateX(-33.33%)} to{transform:translateX(0)} }
      `}</style>
    </div>
  );
}

function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          height: '100%', display: 'flex', flexDirection: 'column',
          transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: tilt.x === 0 ? 'transform 0.5s ease' : 'transform 0.1s ease',
          cursor: 'pointer',
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden', height: '240px' }}>
          <img src={product.image} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(20%) brightness(0.9)', transition: 'transform 0.6s ease, filter 0.4s ease' }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.filter = 'sepia(0%) brightness(1)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.filter = 'sepia(20%) brightness(0.9)'; }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'; }}
          />
          {product.badge && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: 'var(--bg)', color: 'var(--gold)',
              fontSize: '9px', padding: '3px 8px', letterSpacing: '2px',
              fontFamily: "'Cinzel',serif", border: '1px solid var(--border-md)',
            }}>
              {product.badge.toUpperCase()}
            </div>
          )}
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'var(--crimson)', color: 'white',
            fontSize: '9px', padding: '3px 8px', letterSpacing: '1px', fontFamily: 'sans-serif',
          }}>
            -{discount}%
          </div>
          {product.stock <= 5 && (
            <div style={{
              position: 'absolute', bottom: '12px', left: '12px',
              background: 'rgba(139,32,32,0.9)', color: 'white',
              fontSize: '9px', padding: '3px 8px', letterSpacing: '1px',
            }}>
              ONLY {product.stock} LEFT
            </div>
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,8,5,0.8) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />
        </div>

        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: "'Yatra One',serif", fontSize: '16px', color: 'var(--gold)', marginBottom: '2px', lineHeight: 1.3 }}>
            {product.name}
          </div>
          <div className="devanagari" style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '10px' }}>
            {product.hindi}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic', marginBottom: '14px', flex: 1, lineHeight: '1.5' }}>
            {product.description?.slice(0, 72)}...
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span style={{ fontFamily: "'Yatra One',serif", fontSize: '20px', color: 'var(--ink)' }}>
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-dim)', textDecoration: 'line-through', marginLeft: '8px' }}>
                ₹{product.original_price?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <button onClick={handleAdd} style={{
            background: added ? 'rgba(45,106,79,0.3)' : 'transparent',
            color: added ? '#4aaa7a' : 'var(--gold)',
            border: `1px solid ${added ? 'rgba(45,106,79,0.4)' : 'var(--border-md)'}`,
            padding: '9px', fontFamily: "'Cinzel',serif", fontSize: '11px',
            letterSpacing: '2px', cursor: 'pointer', width: '100%',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { if (!added) { e.target.style.background = 'rgba(212,160,23,0.1)'; e.target.style.borderColor = 'var(--gold)'; } }}
            onMouseLeave={e => { if (!added) { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border-md)'; } }}
          >
            {added ? '✓ ADDED TO CART' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState(10000);
  const [resultCount, setResultCount] = useState(0);

  useScrollReveal();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchProducts({ query: search, category: activeCategory, minPrice: 0, maxPrice: priceRange });
      setProducts(data);
      setResultCount(data.length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, activeCategory, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div>
      <Hero />
      <Marquee />

      <div id="bazaar" style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 80px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px', opacity: 0, transform: 'translateY(24px)', transition: 'all 0.6s ease' }}>
          <div className="ornament">❧ ✦ ❧</div>
          <h2 style={{ fontSize: '36px', marginTop: '12px', color: 'var(--gold)' }}>The Grand Bazaar</h2>
          <div className="devanagari" style={{ fontSize: '20px', color: 'var(--ink-muted)', marginTop: '6px' }}>महा बाज़ार</div>
          <div className="ornament" style={{ marginTop: '12px' }}>— ✦ —</div>
        </div>

        <div className="reveal" style={{ display: 'flex', gap: '12px', marginBottom: '20px', opacity: 0, transform: 'translateY(24px)', transition: 'all 0.6s ease 0.1s' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input className="vt-input" placeholder="Search · खोजें · saree, silk, wedding..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', fontSize: '14px' }}>⌕</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--ink-muted)' }}>
            <span>up to</span>
            <input type="range" min="500" max="10000" step="500" value={priceRange}
              onChange={e => setPriceRange(parseInt(e.target.value))}
              style={{ width: '100px', accentColor: 'var(--gold)' }}
            />
            <span style={{ fontFamily: "'Yatra One',serif", color: 'var(--gold)', minWidth: '60px' }}>₹{priceRange.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', opacity: 0, transform: 'translateY(24px)', transition: 'all 0.6s ease 0.2s' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                padding: '6px 16px',
                background: activeCategory === cat.id ? 'rgba(212,160,23,0.15)' : 'transparent',
                color: activeCategory === cat.id ? 'var(--gold)' : 'var(--ink-muted)',
                border: `1px solid ${activeCategory === cat.id ? 'var(--gold)' : 'var(--border)'}`,
                cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '10px',
                letterSpacing: '2px', transition: 'all 0.3s',
              }}>
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontStyle: 'italic', letterSpacing: '2px' }}>
            {loading ? 'searching...' : `${resultCount} items`}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: '420px', background: 'var(--bg2)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            <div className="ornament">❧ ✦ ❧</div>
            <p style={{ marginTop: '16px', fontSize: '18px' }}>No items found · कोई वस्तु नहीं मिली</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((product, i) => (
              <div key={product.id} className="reveal" style={{ opacity: 0, transform: 'translateY(24px)', transition: `all 0.5s ease ${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px', opacity: 0, transform: 'translateY(24px)', transition: 'all 0.6s ease' }}>
            <div className="ornament">❧ ✦ ❧</div>
            <h2 style={{ fontSize: '32px', marginTop: '12px' }}>How it Works</h2>
            <div className="devanagari" style={{ fontSize: '16px', color: 'var(--ink-muted)', marginTop: '6px' }}>कैसे काम करता है</div>
            <div className="ornament" style={{ marginTop: '12px' }}>— ✦ —</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'var(--border)' }}>
            {[
              { num: '01', label: 'Browse & Search', hindi: 'खोजें', desc: 'Discover 12 handcrafted categories with full-text search' },
              { num: '02', label: 'Add to Thela', hindi: 'थेले में डालें', desc: 'Real-time cart with live stock validation' },
              { num: '03', label: 'Razorpay Checkout', hindi: 'भुगतान करें', desc: 'Secure INR payment in test mode' },
              { num: '04', label: 'Track Hukum', hindi: 'आदेश ट्रैक करें', desc: 'Live status via RabbitMQ event pipeline' },
            ].map((step, i) => (
              <div key={i} className="reveal" style={{
                background: 'var(--bg)', padding: '32px 24px',
                opacity: 0, transform: 'translateY(24px)',
                transition: `all 0.5s ease ${i * 0.15}s`,
                borderBottom: '2px solid transparent',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderBottomColor = 'var(--gold)'; e.currentTarget.style.background = 'var(--bg2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderBottomColor = 'transparent'; e.currentTarget.style.background = 'var(--bg)'; }}
              >
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '32px', color: 'rgba(212,160,23,0.2)', marginBottom: '12px' }}>{step.num}</div>
                <div style={{ fontFamily: "'Yatra One',serif", fontSize: '16px', color: 'var(--gold)', marginBottom: '4px' }}>{step.label}</div>
                <div className="devanagari" style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '10px' }}>{step.hindi}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic', lineHeight: '1.6' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
    </div>
  );
}
