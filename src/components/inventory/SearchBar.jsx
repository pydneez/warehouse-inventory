import './Inventory.css';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="searchbar-wrap">
      <span className="searchbar-icon">⌕</span>
      <input
        className="searchbar-input"
        type="text"
        placeholder="Search by name or item code..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="searchbar-clear" onClick={() => onChange('')}>✕</button>
      )}
    </div>
  );
}
