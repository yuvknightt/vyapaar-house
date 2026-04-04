import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { api } from '../utils/api';

export default function Aadesh() {
  const [form, setForm] = useState({ productId: '', qty: '', customerEmail: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qtyError, setQtyError] = useState(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.productId) {
      const p = products.find(p => p.id === parseInt(form.productId));
      setSelectedProduct(p || null);
      setQtyError(null);
    } else {
      setSelectedProduct(null);
    }
  }, [form.productId, products]);

  const handleQtyChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, qty: val });
    if (selectedProduct && parseInt(val) > selectedProduct.stock) {
      setQtyError(`Only ${selectedProduct.stock} units available in the bhandar`);
    } else if (parseInt(val) < 1) {
      setQtyError('Quantity must be at least 1');
    } else {
      setQtyError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (qtyError) return;
    if (selectedProduct && parseInt(form.qty) > selectedProduct.stock) {
      setQtyError(`Only ${selectedProduct.stock} units available`);
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const order = await api.createOrder({
        productId: parseInt(form.productId),
        qty: parseInt(form.qty),
        customerEmail: form.customerEmail,
      });
      setResult(order);
      setForm({ productId: '', qty: '', customerEmail: '' });
      setSelectedProduct(null);
      api.getProducts().then(setProducts).catch(() => {});
    } catch (err) {
      setError('The hukum could not be processed · ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px 48px' }}>
      <PageHeader
        title="Aadesh Den"
        hindi="आदेश दें"
        subtitle="issue a new trade requisition · नया व्यापार आदेश"
      />

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">New Requisition</span>
          <span className="panel-sub">नई माँग पत्र</span>
        </div>
        <div className="panel-body" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '16px' }}>
              <label className="vt-label">Vastu (Product)</label>
              <select
                className="vt-input"
                value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value, qty: '' })}
                required
              >
                <option value="">— Select a vastu —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock === 0}>
                    {p.id} · {p.name} ({p.stock} available{p.stock === 0 ? ' · Out of stock' : ''})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: 'var(--parchment)',
                border: '1px solid var(--parchment-border)',
                fontSize: '13px',
                color: 'var(--ink-muted)',
                fontStyle: 'italic',
              }}>
                <span style={{ color: 'var(--indigo)', fontStyle: 'normal', fontFamily: "'Yatra One', serif" }}>
                  {selectedProduct.name}
                </span>
                {' '}— {selectedProduct.stock} units remain in the bhandar
                {selectedProduct.stock <= 3 && (
                  <span style={{ color: 'var(--gulaal)', marginLeft: '8px' }}>· Critical stock!</span>
                )}
                {selectedProduct.stock <= 10 && selectedProduct.stock > 3 && (
                  <span style={{ color: 'var(--haldi)', marginLeft: '8px' }}>· Low stock</span>
                )}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label className="vt-label">Matra (Quantity)</label>
              <input
                className="vt-input"
                type="number"
                min="1"
                max={selectedProduct?.stock || 999}
                placeholder={selectedProduct ? `Max: ${selectedProduct.stock}` : 'Select a product first'}
                value={form.qty}
                onChange={handleQtyChange}
                disabled={!selectedProduct || selectedProduct.stock === 0}
                required
                style={{ borderColor: qtyError ? 'var(--gulaal)' : undefined }}
              />
              {qtyError && (
                <div style={{ fontSize: '12px', color: 'var(--gulaal)', fontStyle: 'italic', marginTop: '4px' }}>
                  ✗ {qtyError}
                </div>
              )}
              {!qtyError && form.qty && selectedProduct && (
                <div style={{ fontSize: '12px', color: 'var(--mehendi)', fontStyle: 'italic', marginTop: '4px' }}>
                  ✓ {parseInt(form.qty)} of {selectedProduct.stock} available units
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="vt-label">Vyapaari Pata (Email)</label>
              <input
                className="vt-input"
                type="email"
                placeholder="correspondence address"
                value={form.customerEmail}
                onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                required
              />
            </div>

            <button
              className="vt-btn"
              type="submit"
              disabled={loading || !!qtyError || !form.productId || !form.qty || !form.customerEmail}
            >
              {loading ? 'Issuing Hukum...' : 'SUBMIT HUKUM · हुक्म जारी करें'}
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: '20px' }} className="panel">
          <div className="panel-head">
            <span className="panel-title">Hukum Issued</span>
            <span className="panel-sub">आदेश जारी हुआ</span>
          </div>
          <div className="panel-body" style={{ padding: '20px' }}>
            <div className="divider-ornament">❧ ✦ ❧</div>
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <div style={{ fontFamily: "'Yatra One', serif", fontSize: '28px', color: 'var(--gold)' }}>
                #{result.id}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                Your hukum has been received by the house
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              {[
                { label: 'Product', value: `ID ${result.productId}` },
                { label: 'Quantity', value: result.qty },
                { label: 'Status', value: <StatusBadge status={result.status} /> },
                { label: 'Email', value: result.customerEmail },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--parchment)', padding: '10px', border: '1px solid var(--parchment-border)' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              A confirmation letter has been dispatched via the electronic post.
              Status will update automatically as the house processes your hukum.
            </div>
            <div className="divider-ornament" style={{ marginTop: '12px' }}>— ✦ —</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f5e8e8',
          border: '1px solid var(--gulaal)',
          color: 'var(--gulaal)',
          fontStyle: 'italic',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
