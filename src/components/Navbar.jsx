import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuthContext();
  const { count } = useCart();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Bazaar', hindi: 'बाज़ार' },
    ...(user ? [
      { to: '/my-orders', label: 'My Orders', hindi: 'मेरे आदेश' },
    ] : []),
    ...(isAdmin ? [
      { to: '/admin', label: 'Admin', hindi: 'प्रशासन' },
      { to: '/daftar', label: 'Daftar', hindi: 'दफ्तर' },
    ] : []),
  ];

  return (
    <nav style={{
      background: 'var(--indigo)',
      borderBottom: '3px double var(--gold)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '68px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{
          fontFamily: "'Yatra One', serif",
          color: 'var(--gold)',
          fontSize: '22px',
          letterSpacing: '3px',
        }}>
          VYAPAAR HOUSE
        </div>
        <div style={{
          fontFamily: "'Tiro Devanagari Hindi', serif",
          color: '#8a7a9a',
          fontSize: '11px',
          letterSpacing: '2px',
        }}>
          व्यापार भवन · since MMXXVI
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        {navLinks.map(link => (
          <Link key={link.to} to={link.to} style={{
            textDecoration: 'none',
            textAlign: 'center',
            opacity: location.pathname === link.to ? 1 : 0.6,
            borderBottom: location.pathname === link.to
              ? '2px solid var(--gold)' : '2px solid transparent',
            paddingBottom: '4px',
            transition: 'all 0.2s',
          }}>
            <div style={{ fontFamily: "'Yatra One', serif", color: 'var(--gold)', fontSize: '13px' }}>
              {link.label}
            </div>
            <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", color: '#8a7a9a', fontSize: '11px' }}>
              {link.hindi}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
            <div style={{
              fontFamily: "'Yatra One', serif",
              color: 'var(--gold)',
              fontSize: '13px',
              padding: '6px 14px',
              border: '1px solid var(--gold)',
              borderRadius: '2px',
            }}>
              Cart
              {count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--gulaal)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'sans-serif',
                }}>
                  {count}
                </span>
              )}
            </div>
          </Link>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--gold)', fontFamily: "'Yatra One', serif" }}>
                {profile?.full_name || user.email.split('@')[0]}
              </div>
              {isAdmin && (
                <div style={{ fontSize: '10px', color: '#8a7a9a', letterSpacing: '2px' }}>admin</div>
              )}
            </div>
            <button onClick={handleSignOut} style={{
              background: 'transparent',
              border: '1px solid #8a7a9a',
              color: '#8a7a9a',
              padding: '4px 12px',
              cursor: 'pointer',
              fontFamily: "'Crimson Text', serif",
              fontSize: '12px',
              letterSpacing: '1px',
            }}>
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'var(--gold)',
              border: 'none',
              color: 'var(--indigo)',
              padding: '7px 18px',
              cursor: 'pointer',
              fontFamily: "'Yatra One', serif",
              fontSize: '13px',
              letterSpacing: '1px',
            }}>
              Login · प्रवेश
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
