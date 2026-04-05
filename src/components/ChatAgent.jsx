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
    <div style={{ background:'#fffdf7', border:'1px solid #d4b896', padding:'10px', display:'flex', gap:'10px', marginTop:'6px', width:'100%' }}>
      <img src={product.image} alt={product.name}
        style={{ width:'52px', height:'52px', objectFit:'cover', border:'1px solid #d4b896', flexShrink:0 }}
        onError={e => { e.target.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=60'; }}
      />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Yatra One',serif", fontSize:'12px', color:'#1a1a3e', lineHeight:1.3 }}>{product.name}</div>
        <div style={{ fontFamily:"'Tiro Devanagari Hindi',serif", fontSize:'10px', color:'#d4a017' }}>{product.hindi}</div>
        <div style={{ fontSize:'12px', color:'#7a6a4a', marginTop:'2px' }}>
          ₹{product.price?.toLocaleString('en-IN')}
          <span style={{ textDecoration:'line-through', marginLeft:'4px', fontSize:'10px' }}>₹{product.original_price?.toLocaleString('en-IN')}</span>
          <span style={{ marginLeft:'4px', color:'#2d6a4f', fontSize:'10px' }}>-{discount}%</span>
        </div>
        {product.badge && <div style={{ fontSize:'9px', background:'#1a1a3e', color:'#d4a017', padding:'1px 5px', display:'inline-block', marginTop:'2px' }}>{product.badge}</div>}
        <button onClick={handleAdd} style={{
          background: added ? '#2d6a4f' : '#1a1a3e', color:'#d4a017',
          border:'1px solid #d4a017', padding:'2px 8px', fontSize:'10px',
          cursor:'pointer', fontFamily:"'Yatra One',serif", marginTop:'4px', display:'block',
        }}>{added ? '✓ Added' : '+ Add to Cart'}</button>
      </div>
    </div>
  );
}

function Bubble({ msg, onAdd }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth:'88%', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && <div style={{ fontSize:'10px', color:'#7a6a4a', marginBottom:'3px', letterSpacing:'1px' }}>✦ Vyapaar AI</div>}
      {msg.toolLabel && (
        <div style={{ background:'#f5ead0', border:'1px dashed #d4b896', padding:'3px 8px', fontSize:'10px', color:'#7a6a4a', fontStyle:'italic', marginBottom:'3px' }}>
          ⚙ {msg.toolLabel}
        </div>
      )}
      {msg.text && (
        <div style={{
          padding:'10px 13px', fontSize:'13px', lineHeight:'1.6', border:'1px solid #d4b896',
          background: isUser ? '#1a1a3e' : '#fffdf7',
          color: isUser ? '#d4a017' : '#1a1208',
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
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const { items: cartItems, addItem, removeItem, clearCart } = useCart();
  const { user } = useAuthContext();

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = user
        ? `Namaste ${user.email.split('@')[0]}! 🙏 Main hoon Vyapaar — aapka personal shopping assistant.\n\nMain kar sakta hoon:\n• Products search karna\n• Cart manage karna\n• Order place karna\n• Past orders dikhana\n\nKya chahiye aapko?`
        : `Namaste! 🙏 Main hoon Vyapaar — aapka shopping assistant.\n\nMain aapke liye products search kar sakta hoon aur suggest kar sakta hoon.\n\nCart, orders aur checkout ke liye please login karein.\n\nKya dhundh rahe hain?`;
      setMessages([{ role:'agent', text: greeting }]);
    }
  }, [open, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

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
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ messages: msgs }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
    if (data.error) throw new Error(data.error);
    return data;
  };

  const send = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;
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
          setMessages(prev => [...prev, { role:'agent', text: respText || 'Kuch samajh nahi aaya, dobara poochein.', products: foundProducts }]);
          foundProducts = null;
          break;
        }

        const toolResults = [];
        for (const tc of toolCalls) {
          setMessages(prev => [...prev, { role:'agent', text:`⚙ ${tc.name.replace(/_/g,' ')}...`, isStatus:true }]);
          const result = await executeToolCall(tc.name, tc.args, cartItems, cartActions, user);
          setMessages(prev => prev.filter(m => !m.isStatus));
          if (tc.name === 'search_products' && result.products?.length) foundProducts = result.products;
          toolResults.push({ role:'user', parts:[{ functionResponse:{ name:tc.name, response:result } }] });
        }

        const modelMsg = { role:'model', parts: toolCalls.map(tc => ({ functionCall:tc })) };
        currentHistory = [...currentHistory, modelMsg, ...toolResults];
        setHistory(currentHistory);

        if (done) {
          setMessages(prev => [...prev, { role:'agent', text: respText || '', products: foundProducts }]);
          foundProducts = null;
          break;
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role:'agent', text:`Error: ${e.message}` }]);
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
      <button onClick={() => setOpen(o => !o)} style={{
        position:'fixed', bottom:'24px', right:'24px',
        background: open ? '#d4a017' : '#1a1a3e',
        color: open ? '#1a1a3e' : '#d4a017',
        border:'2px solid #d4a017', borderRadius:'50%',
        width:'54px', height:'54px', fontSize:'18px',
        cursor:'pointer', zIndex:1000,
        fontFamily:"'Yatra One',serif",
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.2s',
        boxShadow:'0 4px 16px rgba(26,26,62,0.3)',
      }}>
        {open ? '✕' : '✦'}
      </button>

      {open && (
        <div style={{
          position:'fixed', bottom:'90px', right:'24px',
          width:'360px', height:'580px',
          background:'#fdf6e3', border:'2px solid #d4a017',
          display:'flex', flexDirection:'column',
          zIndex:999,
          boxShadow:'0 8px 32px rgba(26,26,62,0.25)',
          animation:'slideUp 0.2s ease',
        }}>
          <div style={{ background:'#1a1a3e', borderBottom:'2px solid #d4a017', padding:'10px 14px', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontFamily:"'Yatra One',serif", color:'#d4a017', fontSize:'14px', letterSpacing:'2px' }}>✦ VYAPAAR AI</div>
                <div style={{ fontSize:'10px', color:'#8a7a9a', letterSpacing:'1px' }}>व्यापार सहायक · shopping assistant</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'5px', justifyContent:'flex-end' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4a7a4a' }}/>
                  <span style={{ fontSize:'10px', color:'#8a7a9a' }}>{user ? user.email.split('@')[0] : 'Guest'}</span>
                </div>
                {cartCount > 0 && (
                  <div style={{ fontSize:'10px', color:'#d4a017', marginTop:'2px', fontFamily:"'Yatra One',serif" }}>
                    Cart: {cartCount} · ₹{cartTotal.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!user && (
            <div style={{ background:'#f5ead0', borderBottom:'1px solid #d4b896', padding:'6px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <span style={{ fontSize:'11px', color:'#7a6a4a', fontStyle:'italic' }}>Login for cart, orders & checkout</span>
              <Link to="/login" onClick={() => setOpen(false)} style={{ color:'#d4a017', fontFamily:"'Yatra One',serif", fontSize:'11px', textDecoration:'none' }}>
                Login →
              </Link>
            </div>
          )}

          <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} onAdd={(p) => {
                if (!user) { setMessages(prev => [...prev, { role:'agent', text:'Cart mein add karne ke liye please login karein! /login par jayein.' }]); return; }
                addItem(p, 1);
                setMessages(prev => [...prev, { role:'agent', text:`✓ ${p.name} cart mein add ho gaya! ₹${p.price.toLocaleString('en-IN')}` }]);
              }} />
            ))}

            {messages.length === 1 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    background:'transparent', border:'1px solid #d4b896',
                    padding:'4px 8px', fontSize:'11px', color:'#7a6a4a',
                    cursor:'pointer', fontFamily:"'Crimson Text',serif", fontStyle:'italic',
                  }}>{s}</button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{ alignSelf:'flex-start' }}>
                <div style={{ padding:'10px 13px', background:'#fffdf7', border:'1px solid #d4b896', display:'flex', gap:'4px', alignItems:'center' }}>
                  {[0,150,300].map(d => (
                    <div key={d} style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#d4a017', animation:'bounce 0.8s infinite', animationDelay:`${d}ms` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          <div style={{ borderTop:'1px solid #d4b896', background:'#f5ead0', padding:'10px', display:'flex', gap:'8px', flexShrink:0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter') send(); }}
              placeholder="Kya dhundh rahe hain..."
              style={{
                flex:1, background:'#fdf6e3', border:'1px solid #d4b896',
                padding:'8px 12px', fontFamily:"'Crimson Text',serif",
                fontSize:'13px', color:'#1a1208', outline:'none',
              }}
            />
            <button onClick={() => send()} disabled={loading} style={{
              background:'#1a1a3e', color:'#d4a017', border:'1px solid #d4a017',
              padding:'8px 14px', fontFamily:"'Yatra One',serif", fontSize:'13px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, flexShrink:0,
            }}>✦</button>
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
