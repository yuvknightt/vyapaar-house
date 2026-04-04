import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { api } from '../utils/api';

export default function Aadesh() {
  const [form, setForm] = useState({ productId: '', qty: '', customerEmail: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
              <label className="vt-label">Vastu Sankhya (Product ID)</label>
              <input
                className="vt-input"
                placeholder="e.g. 101, 102, 103"
                value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value })}
                required
              />
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                101 · Laptop Stand &nbsp;|&nbsp; 102 · Keyboard &nbsp;|&nbsp; 103 · Monitor
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="vt-label">Matra (Quantity)</label>
              <input
                className="vt-input"
                type="number"
                min="1"
                placeholder="How many units?"
                value={form.qty}
                onChange={e => setForm({ ...form, qty: e.target.value })}
                required
              />
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

            <button className="vt-btn" type="submit" disabled={loading}>
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
              A confirmation letter has been dispatched to your address via the electronic post
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
