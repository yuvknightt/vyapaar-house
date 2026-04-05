import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visible, setVisible] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    if (mode === 'login') {
      const { error } = await signInWithEmail(form.email, form.password);
      if (error) setError(error.message); else navigate('/');
    } else {
      const { error } = await signUpWithEmail(form.email, form.password, form.fullName);
      if (error) setError(error.message);
      else { setSuccess('Account created! You can now sign in.'); setMode('login'); }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '40px 24px' }}>
      {[
        { w:500, h:500, top:'-10%', left:'-10%', color:'rgba(212,160,23,0.06)' },
        { w:300, h:400, bottom:'5%', right:'5%', color:'rgba(139,32,32,0.08)' },
        { w:200, h:200, top:'50%', left:'60%', color:'rgba(45,106,79,0.08)' },
      ].map((orb, i) => (
        <div key={i} style={{
          position:'absolute', width:orb.w, height:orb.h, borderRadius:'50%',
          background:`radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          top:orb.top, left:orb.left, bottom:orb.bottom, right:orb.right,
          animation:`orbFloat ${5+i}s ease-in-out infinite ${i*1.5}s`, pointerEvents:'none',
        }} />
      ))}

      <div style={{
        width: '100%', maxWidth: '440px', position: 'relative', zIndex: 2,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'all 0.8s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="ornament">❧ ✦ ❧</div>
          <h1 style={{ fontSize: '36px', marginTop: '12px', color: 'var(--gold)' }}>
            {mode === 'login' ? 'Pravesh' : 'Naya Khata'}
          </h1>
          <div className="devanagari" style={{ fontSize: '20px', color: 'var(--ink-muted)', marginTop: '6px' }}>
            {mode === 'login' ? 'प्रवेश' : 'नया खाता'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-dim)', letterSpacing: '3px', marginTop: '8px', fontStyle: 'italic' }}>
            {mode === 'login' ? 'welcome back to the house' : 'join the trading house'}
          </div>
          <div className="ornament" style={{ marginTop: '12px' }}>— ✦ —</div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '32px' }}>
          <button onClick={handleGoogle} style={{
            width: '100%', padding: '12px', background: 'var(--bg3)',
            border: '1px solid var(--border)', cursor: 'pointer',
            fontFamily: "'Crimson Text',serif", fontSize: '14px', color: 'var(--ink)',
            marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', letterSpacing: '1px', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--ink-dim)', letterSpacing: '3px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '16px' }}>
                <label className="vt-label">Full Name · पूरा नाम</label>
                <input className="vt-input" placeholder="Your full name"
                  value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label className="vt-label">Email · ईमेल</label>
              <input className="vt-input" type="email" placeholder="your@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label className="vt-label">Password · पासवर्ड</label>
              <input className="vt-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(139,32,32,0.15)', border: '1px solid rgba(139,32,32,0.3)', color: '#c04040', fontSize: '13px', fontStyle: 'italic' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(45,106,79,0.15)', border: '1px solid rgba(45,106,79,0.3)', color: '#4aaa7a', fontSize: '13px', fontStyle: 'italic' }}>
                {success}
              </div>
            )}

            <button className="vt-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'SIGN IN · प्रवेश करें' : 'CREATE ACCOUNT · खाता बनाएं'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--ink-muted)' }}>
            {mode === 'login' ? (
              <>New to the house?{' '}
                <button onClick={() => { setMode('register'); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontFamily: "'Crimson Text',serif", fontSize: '13px', textDecoration: 'underline' }}>
                  Create account
                </button>
              </>
            ) : (
              <>Already a member?{' '}
                <button onClick={() => { setMode('login'); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontFamily: "'Crimson Text',serif", fontSize: '13px', textDecoration: 'underline' }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes orbFloat{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
    </div>
  );
}
