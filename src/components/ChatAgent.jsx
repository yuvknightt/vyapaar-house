import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { executeToolCall } from '../utils/agentTools';

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
  const handleAdd = () => { onAdd(product); setAdded(true); setTimeout(() => setAdded(false), 2000); };
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px', display:'flex', gap:'10px', marginTop:'6px', width:'100%' }}>
      <img src={product.image} alt={product.name}
        style={{ width:'52px', height:'52px', objectFit:'cover', border:'1px solid var(--border)', flexShrink:0 }}
        onError={e => { e.target.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=60'; }}
      />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Yatra One',serif", fontSize:'12px', color:'var(--gold)', lineHeight:1.3 }}>{product.name}</div>
        <div style={{ fontFamily:"'Tiro Devanagari Hindi',serif", fontSize:'10px', color:'var(--ink-muted)' }}>{product.hindi}</div>
        <div style={{ fontSize:'12px', color:'var(--ink-muted)', marginTop:'2px' }}>
          ₹{product.price?.toLocaleString('en-IN')}
          <span style={{ textDecoration:'line-through', marginLeft:'4px', fontSize:'10px' }}>₹{product.original_price?.toLocaleString('en-IN')}</span>
          <span style={{ marginLeft:'4px', color:'#4aaa7a', fontSize:'10px' }}>-{discount}%</span>
        </div>
        {product.badge && (
          <div style={{ fontSize:'9px', background:'var(--bg)', color:'var(--gold)', padding:'1px 5px', display:'inline-block', marginTop:'2px', border:'1px solid var(--border)' }}>
            {product.badge}
          </div>
        )}
        <button onClick={handleAdd} style={{
          background: added ? 'rgba(45,106,79,0.3)' : 'transparent',
          color: added ? '#4aaa7a' : 'var(--gold)',
          border: `1px solid ${added ? 'rgba(45,106,79,0.4)' : 'var(--border-md)'}`,
          padding:'2px 8px', fontSize:'10px', cursor:'pointer',
          fontFamily:"'Cinzel',serif", marginTop:'4px', display:'block',
          letterSpacing:'1px', transition:'all 0.2s',
        }}>{added ? '✓ Added' : '+ Add to Cart'}</button>
      </div>
    </div>
  );
}

function Bubble({ msg, onAdd }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth:'88%', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={{ fontSize:'10px', color:'var(--ink-muted)', marginBottom:'3px', letterSpacing:'1px', fontFamily:"'Cinzel',serif" }}>
          ✦ VYAPAAR AI
        </div>
      )}
      {msg.toolLabel && (
        <div style={{ background:'rgba(212,160,23,0.05)', border:'1px dashed var(--border)', padding:'3px 8px', fontSize:'10px', color:'var(--ink-muted)', fontStyle:'italic', marginBottom:'3px' }}>
          ⚙ {msg.toolLabel}
        </div>
      )}
      {msg.text && (
        <div style={{
          padding:'10px 13px', fontSize:'13px', lineHeight:'1.6',
          border:'1px solid var(--border)',
          background: isUser ? 'rgba(212,160,23,0.1)' : 'var(--bg3)',
          color: isUser ? 'var(--gold)' : 'var(--ink)',
          borderColor: isUser ? 'var(--border-md)' : 'var(--border)',
        }}>
          {msg.text.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length-1 && <br/>}</span>
          ))}
        </div>
      )}
      {msg.products?.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
    </div>
  );
}

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const countdownRef = useRef(null);
  const { items: cartItems, addItem, removeItem, clearCart } = useCart();
  const { user } = useAuthContext();

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = user
        ? `Namaste ${user.email.split('@')[0]}! 🙏\n\nMain kar sakta hoon:\n• Products search karna\n• Cart manage karna\n• Order place karna\n• Past orders dikhana\n\nKya chahiye aapko?`
        : `Namaste! 🙏 Main hoon Vyapaar AI.\n\nProducts search kar sakta hoon aur suggest kar sakta hoon.\n\nCart aur orders ke liye please login karein.\n\nKya dhundh rahe hain?`;
      setMessages([{ role:'agent', text: greeting }]);
    }
  }, [open, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const cartActions = { addItem, removeItem, clearCart };

  const parseResponse = (data) => {
    const candidate = data.candidates?.[0];
    if (!candidate) throw new Error('No response from Gemini');
    const parts = candidate.content?.parts || [];
    return {
      text: parts.filter(p => p.text).map(p => p.text).join('\n'),
      toolCalls: parts.filter(p => p.functionCall).map(p => p.functionCall),
      done: candidate.finishReason === 'STOP' || candidate.finishReason === 'MAX_TOKENS',
    };
  };

  const callAPI = async (msgs) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs }),
    });
    const data = await res.json();

    if (res.status === 429) {
      const seconds = data.retryAfter || 60;
      setRateLimited(true);
      setRetryAfter(seconds);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setRetryAfter(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      throw new Error(data.message || 'Rate limit exceeded');
    }

    if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
    if (data.error) throw new Error(data.error);
    return data;
  };

  const send = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading || rateLimited) return;
    setInput('');
    setMessages(prev => [...prev, { role:'user', text }]);
    const newHistory = [...history, { role:'user', parts:[{ text }] }];
    setHistory(newHistory);
    setLoading(true);

    try {
      let currentHistory = newHistory;
      let foundProducts = null;
      let iters = 0;

      while (iters < 6) {
        iters++;
        const data = await callAPI(currentHistory);
        const { text: respText, toolCalls, done } = parseResponse(data);

        if (!toolCalls.length) {
          setHistory(prev => [...prev, { role:'model', parts:[{ text: respText }] }]);
          setMessages(prev => [...prev, {
            role:'agent',
            text: respText || 'Kuch samajh nahi aaya, dobara poochein.',
            products: foundProducts,
          }]);
          foundProducts = null;
          break;
        }

        const toolResults = [];
        for (const tc of toolCalls) {
          setMessages(prev => [...prev, { role:'agent', text:`⚙ ${tc.name.replace(/_/g,' ')}...`, isStatus:true }]);
          const result = await executeToolCall(tc.name, tc.args, cartItems, cartActions, user);
          setMessages(prev => prev.filter(m => !m.isStatus));
          if (tc.name === 'search_products' && result.products?.length) foundProducts = result.products;
          toolResults.push({
            role:'user',
            parts:[{ functionResponse:{ name:tc.name, response:result } }]
          });
        }

        const modelMsg = { role:'model', parts: toolCalls.map(tc => ({ functionCall:tc })) };
        currentHistory = [...currentHistory, modelMsg, ...toolResults];
        setHistory(currentHistory);

        if (done) {
          const { text: respText } = parseResponse(data);
          setMessages(prev => [...prev, { role:'agent', text: respText || '', products: foundProducts }]);
          foundProducts = null;
          break;
        }
      }
    } catch (e) {
      if (!rateLimited) {
        setMessages(prev => [...prev, { role:'agent', text:`Error: ${e.message}` }]);
      }
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const suggestions = user
    ? ['Silk saree dikhao', 'Budget ₹2000', 'Shaadi ke liye', 'Cart dikhao', 'Mere orders']
    : ['Silk saree dikhao', 'Budget ₹2000', 'Shaadi ke liye', 'Bridal jewellery', 'Office wear'];

  const cartCount = cartItems.reduce((s,i) => s+i.qty, 0);
  const cartTotal = cartItems.reduce((s,i) => s+i.price*i.qty, 0);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:'fixed', bottom:'24px', right:'24px',
          background: open ? 'var(--gold)' : 'var(--bg2)',
          color: open ? 'var(--bg)' : 'var(--gold)',
          border:'1px solid var(--gold)',
          borderRadius:'50%', width:'52px', height:'52px',
          fontSize:'18px', cursor:'pointer', zIndex:1000,
          fontFamily:"'Yatra One',serif",
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.3s',
          boxShadow:'0 4px 20px rgba(212,160,23,0.2)',
        }}
      >
        {open ? '✕' : '✦'}
      </button>

      {open && (
        <div style={{
          position:'fixed', bottom:'88px', right:'24px',
          width:'360px', height:'580px',
          background:'var(--bg2)', border:'1px solid var(--border-md)',
          display:'flex', flexDirection:'column',
          zIndex:999,
          boxShadow:'0 8px 40px rgba(0,0,0,0.4)',
          animation:'slideUp 0.2s ease',
        }}>

          <div style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)', padding:'12px 14px', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", color:'var(--gold)', fontSize:'12px', letterSpacing:'3px' }}>
                  ✦ VYAPAAR AI
                </div>
                <div className="devanagari" style={{ fontSize:'10px', color:'var(--ink-muted)', marginTop:'2px' }}>
                  व्यापार सहायक
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'5px', justifyContent:'flex-end' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background: rateLimited ? 'var(--crimson)' : '#4a7a4a' }}/>
                  <span style={{ fontSize:'10px', color:'var(--ink-muted)', fontFamily:"'Cinzel',serif", letterSpacing:'1px' }}>
                    {rateLimited ? `cooldown ${retryAfter}s` : user ? user.email.split('@')[0] : 'Guest'}
                  </span>
                </div>
                {cartCount > 0 && (
                  <div style={{ fontSize:'10px', color:'var(--gold)', marginTop:'2px', fontFamily:"'Yatra One',serif" }}>
                    {cartCount} items · ₹{cartTotal.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {rateLimited && (
            <div style={{
              background:'rgba(139,32,32,0.15)',
              borderBottom:'1px solid rgba(139,32,32,0.3)',
              padding:'8px 14px', fontSize:'11px',
              color:'#c04040', fontStyle:'italic',
              flexShrink:0, textAlign:'center', letterSpacing:'1px',
            }}>
              ✦ Bahut zyada requests · Retry in {retryAfter}s · बहुत अधिक अनुरोध
            </div>
          )}

          {!user && (
            <div style={{ background:'rgba(212,160,23,0.05)', borderBottom:'1px solid var(--border)', padding:'6px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <span style={{ fontSize:'11px', color:'var(--ink-muted)', fontStyle:'italic' }}>Login for cart, orders & checkout</span>
              <Link to="/login" onClick={() => setOpen(false)} style={{ color:'var(--gold)', fontFamily:"'Cinzel',serif", fontSize:'10px', textDecoration:'none', letterSpacing:'1px' }}>
                LOGIN →
              </Link>
            </div>
          )}

          <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} onAdd={(p) => {
                if (!user) {
                  setMessages(prev => [...prev, { role:'agent', text:'Cart ke liye please login karein! /login par jayein.' }]);
                  return;
                }
                addItem(p, 1);
                setMessages(prev => [...prev, { role:'agent', text:`✓ ${p.name} cart mein add ho gaya! ₹${p.price.toLocaleString('en-IN')}` }]);
              }} />
            ))}

            {messages.length === 1 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    background:'transparent', border:'1px solid var(--border)',
                    padding:'4px 8px', fontSize:'11px', color:'var(--ink-muted)',
                    cursor:'pointer', fontFamily:"'Crimson Text',serif",
                    fontStyle:'italic', transition:'all 0.2s',
                  }}
                    onMouseEnter={e=>{e.target.style.borderColor='var(--gold)';e.target.style.color='var(--gold)'}}
                    onMouseLeave={e=>{e.target.style.borderColor='var(--border)';e.target.style.color='var(--ink-muted)'}}
                  >{s}</button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{ alignSelf:'flex-start' }}>
                <div style={{ padding:'10px 13px', background:'var(--bg3)', border:'1px solid var(--border)', display:'flex', gap:'4px', alignItems:'center' }}>
                  {[0,150,300].map(d => (
                    <div key={d} style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--gold)', animation:'bounce 0.8s infinite', animationDelay:`${d}ms` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          <div style={{ borderTop:'1px solid var(--border)', background:'var(--bg3)', padding:'10px', display:'flex', gap:'8px', flexShrink:0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter' && !rateLimited) send(); }}
              placeholder={rateLimited ? `Wait ${retryAfter}s...` : 'Kya dhundh rahe hain...'}
              disabled={rateLimited}
              style={{
                flex:1, background:'var(--bg2)', border:'1px solid var(--border)',
                padding:'8px 12px', fontFamily:"'Crimson Text',serif",
                fontSize:'13px', color: rateLimited ? 'var(--ink-muted)' : 'var(--ink)',
                outline:'none', opacity: rateLimited ? 0.5 : 1,
                transition:'all 0.3s',
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || rateLimited}
              style={{
                background: rateLimited ? 'transparent' : 'var(--bg)',
                color: rateLimited ? 'var(--ink-dim)' : 'var(--gold)',
                border:'1px solid var(--border)',
                padding:'8px 14px', fontFamily:"'Yatra One',serif",
                fontSize:'13px',
                cursor: (loading || rateLimited) ? 'not-allowed' : 'pointer',
                opacity: (loading || rateLimited) ? 0.4 : 1,
                flexShrink:0, transition:'all 0.3s',
              }}
            >✦</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </>
  );
}
