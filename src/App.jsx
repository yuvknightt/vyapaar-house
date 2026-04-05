import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Daftar from './pages/Daftar';
import Hukumnama from './pages/Hukumnama';
import Bhandar from './pages/Bhandar';
import Aadesh from './pages/Aadesh';
import ChatAgent from './components/ChatAgent';
import { useAuthContext } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--ink-muted)', fontStyle: 'italic', letterSpacing: '3px' }}>
      consulting the records...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuthContext();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/daftar" element={<AdminRoute><Daftar /></AdminRoute>} />
            <Route path="/inventory" element={<AdminRoute><Bhandar /></AdminRoute>} />
            <Route path="/dispatch" element={<AdminRoute><Aadesh /></AdminRoute>} />
          </Routes>
        </main>
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '48px 24px',
          background: 'var(--bg2)',
          marginTop: '0',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Yatra One',serif", color: 'var(--gold)', fontSize: '24px', letterSpacing: '4px', marginBottom: '8px' }}>
              VYAPAAR HOUSE
            </div>
            <div className="devanagari" style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px' }}>
              व्यापार भवन · since MMXXVI
            </div>
            <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--gold), transparent)', opacity: 0.3, marginBottom: '24px' }} />
            <div style={{ fontSize: '11px', color: 'var(--ink-dim)', letterSpacing: '3px', fontStyle: 'italic', lineHeight: 2 }}>
              powered by spring boot · rabbitmq · supabase · react · razorpay · gemini
            </div>
            <div className="ornament" style={{ marginTop: '16px', opacity: 0.5 }}>❧ ✦ ❧</div>
          </div>
        </footer>
        <ChatAgent />
      </div>
    </BrowserRouter>
  );
}
