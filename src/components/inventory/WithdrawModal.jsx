import { useState } from 'react';
import './Inventory.css';

export default function WithdrawModal({ item, onConfirm, onClose }) {
  const [qty, setQty]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const max = item.quantity;

  const handleConfirm = async () => {
    if (qty < 1 || qty > max) {
      setError(`Enter a number between 1 and ${max}.`);
      return;
    }
    setLoading(true);
    setError('');
    const result = await onConfirm(qty);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // parent closes modal on success
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Corner marks */}
        <span className="modal-corner modal-corner--tl" />
        <span className="modal-corner modal-corner--tr" />
        <span className="modal-corner modal-corner--bl" />
        <span className="modal-corner modal-corner--br" />

        <div className="modal-header">
          <span className="modal-eyebrow">WITHDRAW ITEM</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-item-info">
            <span className="modal-item-code">{item.item_code}</span>
            <span className="modal-item-name">{item.name}</span>
          </div>

          <div className="modal-stock-row">
            <span className="modal-stock-label">CURRENT STOCK</span>
            <span className="modal-stock-value">{item.quantity} units</span>
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="withdraw-qty">QUANTITY TO WITHDRAW</label>
            <div className="modal-qty-wrap">
              <button
                className="modal-qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >−</button>
              <input
                id="withdraw-qty"
                className="modal-qty-input"
                type="number"
                min={1}
                max={max}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <button
                className="modal-qty-btn"
                onClick={() => setQty((q) => Math.min(max, q + 1))}
                disabled={qty >= max}
              >+</button>
            </div>
          </div>

          <div className="modal-preview">
            <span className="modal-preview-label">REMAINING AFTER WITHDRAWAL</span>
            <span className="modal-preview-value" style={{ color: (max - qty) < 10 ? 'var(--clr-error)' : 'var(--clr-success)' }}>
              {max - qty} units
            </span>
          </div>

          {error && (
            <div className="modal-error">
              <span>!</span> {error}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>CANCEL</button>
          <button
            className="modal-btn-confirm"
            onClick={handleConfirm}
            disabled={loading || qty < 1 || qty > max}
          >
            {loading ? 'PROCESSING...' : 'CONFIRM WITHDRAWAL →'}
          </button>
        </div>
      </div>
    </div>
  );
}
