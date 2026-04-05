import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, loading } = useAuthContext();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Bazaar', hindi: 'बाज़ार' },
    ...(user ? [{ to: '/my-orders', label: 'Orders', hindi: 'आदेश' }] : []),
    ...(isAdmin ? [
      { to: '/admin', label: 'Admin', hindi: 'प्रशासन' },
      { to: '/daftar', label: 'Daftar', hindi: 'दफ्तर' },
    ] : []),
  ];

  return (
    <nav style={{
      background: scrolled ? 'rgba(10,8,5,0.95)' : 'rgba(10,8,5,0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(212,160,23,0.3)' : 'rgba(212,160,23,0.1)'}`,
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.4s ease',
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontFamily: "'Yatra One',serif", color: 'var(--gold)', fontSize: '20px', letterSpacing: '3px', lineHeight: 1 }}>
          VYAPAAR HOUSE
        </div>
        <div className="devanagari" style={{ fontSize: '10px', color: 'var(--ink-muted)', letterSpacing: '2px' }}>
          व्यापार भवन · since MMXXVI
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {navLinks.map(link => {
          const active = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to} style={{ textDecoration: 'none', textAlign: 'center', position: 'relative', paddingBottom: '4px' }}>
              <div style={{
                fontFamily: "'Cinzel',serif",
                color: active ? 'var(--gold)' : 'var(--ink-muted)',
                fontSize: '11px', letterSpacing: '2px', transition: 'color 0.3s',
              }}>{link.label}</div>
              <div className="devanagari" style={{ fontSize: '10px', color: active ? 'var(--gold)' : 'var(--ink-dim)', marginTop: '1px' }}>
                {link.hindi}
              </div>
              {active && (
                <div style={{ position: 'absolute', bottom: '-16px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)' }} />
              )}
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {!loading && user && (
          <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
            <div style={{
              fontFamily: "'Cinzel',serif", color: 'var(--gold)', fontSize: '11px',
              padding: '7px 16px', border: '1px solid var(--border-md)', letterSpacing: '2px',
              transition: 'all 0.3s', background: count > 0 ? 'rgba(212,160,23,0.1)' : 'transparent',
            }}>
              CART
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: 'var(--crimson)', color: 'white',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'sans-serif',
                }}>{count}</span>
              )}
            </div>
          </Link>
        )}

        {loading ? (
          <div style={{ width: '80px', height: '32px', background: 'var(--bg3)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--gold)', fontFamily: "'Cinzel',serif", letterSpacing: '1px' }}>
                {profile?.full_name || user.email.split('@')[0]}
              </div>
              {isAdmin && <div style={{ fontSize: '9px', color: 'var(--ink-muted)', letterSpacing: '2px' }}>ADMIN</div>}
            </div>
            <button onClick={handleSignOut} style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--ink-muted)', padding: '5px 12px', cursor: 'pointer',
              fontFamily: "'Cinzel',serif", fontSize: '10px', letterSpacing: '1px',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--ink-muted)'; }}
            >
              SIGN OUT
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="vt-btn" style={{ width: 'auto', padding: '8px 20px', fontSize: '11px', letterSpacing: '2px' }}>
              LOGIN
            </button>
          </Link>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
    </nav>
  );
}
