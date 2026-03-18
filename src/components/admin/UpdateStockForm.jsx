import { useState } from 'react';
import './Admin.css';

export default function UpdateStockForm({ items, onUpdate }) {
  const [selectedId, setSelectedId] = useState('');
  const [mode, setMode]             = useState('set');   // 'set' | 'add' | 'subtract'
  const [amount, setAmount]         = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const selectedItem = items.find((i) => i.id === selectedId);

  const previewQty = () => {
    if (!selectedItem) return null;
    if (mode === 'set')      return amount;
    if (mode === 'add')      return selectedItem.quantity + amount;
    if (mode === 'subtract') return selectedItem.quantity - amount;
  };

  const preview = previewQty();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedId) { setError('Select an item first.'); return; }
    if (amount < 0)  { setError('Amount cannot be negative.'); return; }
    if (preview < 0) { setError('Resulting quantity cannot be negative.'); return; }

    setLoading(true);
    const result = await onUpdate({ itemId: selectedId, newQuantity: preview });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Stock for "${selectedItem.name}" updated to ${preview} units.`);
      setSelectedId('');
      setAmount(0);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <span className="admin-card-eyebrow">MANAGE STOCK</span>
        <h2 className="admin-card-title">Update Quantity</h2>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        {/* Item picker */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="update-item">
            <span className="admin-label-tag">01</span> SELECT ITEM
          </label>
          <select
            id="update-item"
            className="admin-input admin-select"
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setError(''); setSuccess(''); }}
          >
            <option value="">— choose an item —</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.item_code}] {item.name} — {item.quantity} in stock
              </option>
            ))}
          </select>
        </div>

        {/* Mode selector */}
        <div className="admin-field">
          <label className="admin-label">
            <span className="admin-label-tag">02</span> UPDATE MODE
          </label>
          <div className="admin-mode-group">
            {[
              { value: 'set',      label: 'SET TO' },
              { value: 'add',      label: 'ADD' },
              { value: 'subtract', label: 'SUBTRACT' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={"admin-mode-btn" + (mode === opt.value ? " admin-mode-btn--active" : "")}
                onClick={() => setMode(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount input */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="update-amount">
            <span className="admin-label-tag">03</span> AMOUNT
          </label>
          <input
            id="update-amount"
            className="admin-input"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        {/* Preview */}
        {selectedItem && preview !== null && (
          <div className="admin-preview">
            <div className="admin-preview-row">
              <span className="admin-preview-label">CURRENT STOCK</span>
              <span className="admin-preview-val">{selectedItem.quantity}</span>
            </div>
            <div className="admin-preview-row">
              <span className="admin-preview-label">AFTER UPDATE</span>
              <span
                className="admin-preview-val"
                style={{ color: preview < 0 ? 'var(--clr-error)' : preview < 10 ? '#fb923c' : '#4ade80' }}
              >
                {preview}
              </span>
            </div>
          </div>
        )}

        {error   && <div className="admin-msg admin-msg--error"><span>!</span> {error}</div>}
        {success && <div className="admin-msg admin-msg--success"><span>✓</span> {success}</div>}

        <button type="submit" className="admin-btn-primary" disabled={loading || !selectedId}>
          {loading ? 'UPDATING...' : 'APPLY UPDATE →'}
        </button>
      </form>
    </div>
  );
}