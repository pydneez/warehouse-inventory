import './Inventory.css';

const STATUS_THRESHOLDS = {
  critical: 10,
  low:      30,
};

function StockBadge({ qty }) {
  let label = 'NOMINAL';
  let cls   = 'badge--nominal';

  if (qty === 0)                          { label = 'OUT';      cls = 'badge--out';      }
  else if (qty <= STATUS_THRESHOLDS.critical) { label = 'CRITICAL'; cls = 'badge--critical'; }
  else if (qty <= STATUS_THRESHOLDS.low)      { label = 'LOW';      cls = 'badge--low';      }

  return <span className={"stock-badge " + cls}>{label}</span>;
}

export default function ItemTable({ items, onWithdraw }) {
  if (items.length === 0) {
    return (
      <div className="table-empty">
        <span className="table-empty-icon">⊘</span>
        <p>No items match your search.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="inv-table">
        <thead>
          <tr>
            <th>ITEM CODE</th>
            <th>NAME</th>
            <th>QTY</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              className="inv-row"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <td className="td-code">{item.item_code}</td>
              <td className="td-name">{item.name}</td>
              <td className="td-qty">{item.quantity}</td>
              <td><StockBadge qty={item.quantity} /></td>
              <td>
                <button
                  className="btn-withdraw"
                  onClick={() => onWithdraw(item)}
                  disabled={item.quantity === 0}
                >
                  WITHDRAW
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
