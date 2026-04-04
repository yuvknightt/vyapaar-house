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
import { useAuthContext } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px', fontStyle: 'italic', color: 'var(--ink-muted)' }}>
      Consulting the records...
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
      <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
        <Navbar />
        <main style={{ paddingTop: '24px' }}>
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
          textAlign: 'center', padding: '20px',
          borderTop: '1px solid var(--parchment-border)', marginTop: '24px',
        }}>
          <div className="ornament">❧ ✦ ❧</div>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '3px', marginTop: '8px', fontStyle: 'italic' }}>
            vyapaar house · powered by rabbitmq · supabase · spring boot · render
          </div>
          <div style={{ fontFamily: "'Tiro Devanagari Hindi', serif", fontSize: '12px', color: 'var(--gold)', marginTop: '4px' }}>
            व्यापार भवन · since MMXXVI
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
