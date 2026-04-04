import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Daftar', hindi: 'दफ्तर' },
  { to: '/orders', label: 'Hukumnama', hindi: 'हुक्मनामा' },
  { to: '/inventory', label: 'Bhandar', hindi: 'भंडार' },
  { to: '/dispatch', label: 'Aadesh', hindi: 'आदेश' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      background: 'var(--indigo)',
      borderBottom: '3px double var(--gold)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '64px',
    }}>
      <div>
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
          fontSize: '12px',
          letterSpacing: '2px',
        }}>
          व्यापार · since MMXXVI
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              textDecoration: 'none',
              textAlign: 'center',
              opacity: location.pathname === link.to ? 1 : 0.6,
              borderBottom: location.pathname === link.to
                ? '2px solid var(--gold)' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              fontFamily: "'Yatra One', serif",
              color: 'var(--gold)',
              fontSize: '13px',
              letterSpacing: '1px',
            }}>{link.label}</div>
            <div style={{
              fontFamily: "'Tiro Devanagari Hindi', serif",
              color: '#8a7a9a',
              fontSize: '11px',
            }}>{link.hindi}</div>
          </Link>
        ))}
      </div>

      <div style={{
        fontSize: '11px',
        color: '#8a7a9a',
        letterSpacing: '2px',
        fontStyle: 'italic',
        textAlign: 'right',
      }}>
        <div>{new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        <div style={{ color: 'var(--gold)', marginTop: '2px' }}>
          <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4a7a4a', display: 'inline-block', marginRight: '4px' }}></span>
          Live
        </div>
      </div>
    </nav>
  );
}
