import { useState } from 'react';
import './Admin.css';

export default function AddItemForm({ onAdd }) {
  const [itemCode, setItemCode] = useState('');
  const [name, setName]         = useState('');
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!itemCode.trim() || !name.trim()) {
      setError('Item code and name are required.');
      return;
    }
    if (quantity < 0) {
      setError('Quantity cannot be negative.');
      return;
    }

    setLoading(true);
    const result = await onAdd({
      itemCode: itemCode.trim().toUpperCase(),
      name: name.trim(),
      quantity,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`"${name.trim()}" added successfully.`);
      setItemCode('');
      setName('');
      setQuantity(100);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <span className="admin-card-eyebrow">NEW ITEM</span>
        <h2 className="admin-card-title">Add to Warehouse</h2>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-field">
          <label className="admin-label" htmlFor="item-code">
            <span className="admin-label-tag">01</span> ITEM CODE
          </label>
          <input
            id="item-code"
            className="admin-input"
            type="text"
            placeholder="e.g. WH-025"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            required
          />
          <p className="admin-field-hint">Must be unique — will be uppercased automatically.</p>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="item-name">
            <span className="admin-label-tag">02</span> ITEM NAME
          </label>
          <input
            id="item-name"
            className="admin-input"
            type="text"
            placeholder="e.g. Safety Goggles"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="item-qty">
            <span className="admin-label-tag">03</span> INITIAL QUANTITY
          </label>
          <input
            id="item-qty"
            className="admin-input"
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        {error   && <div className="admin-msg admin-msg--error"><span>!</span> {error}</div>}
        {success && <div className="admin-msg admin-msg--success"><span>✓</span> {success}</div>}

        <button type="submit" className="admin-btn-primary" disabled={loading}>
          {loading ? 'ADDING...' : 'ADD ITEM →'}
        </button>
      </form>
    </div>
  );
}