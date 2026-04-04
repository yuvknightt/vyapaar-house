import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Daftar from './pages/Daftar';
import Hukumnama from './pages/Hukumnama';
import Bhandar from './pages/Bhandar';
import Aadesh from './pages/Aadesh';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
        <Navbar />
        <main style={{ paddingTop: '24px' }}>
          <Routes>
            <Route path="/" element={<Daftar />} />
            <Route path="/orders" element={<Hukumnama />} />
            <Route path="/inventory" element={<Bhandar />} />
            <Route path="/dispatch" element={<Aadesh />} />
          </Routes>
        </main>
        <footer style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid var(--parchment-border)',
          marginTop: '24px',
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
