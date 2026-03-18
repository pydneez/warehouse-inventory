import { useState, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import SearchBar from '../components/inventory/SearchBar';
import ItemTable from '../components/inventory/ItemTable';
import WithdrawModal from '../components/inventory/WithdrawModal';
import Pagination from '../components/inventory/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useInventory } from '../hooks/useInventory';
import './DashboardPage.css';

const DEFAULT_PAGE_SIZE = 10;

export default function DashboardPage() {
  const { user } = useAuth();
  const { items, loading, error, withdraw } = useInventory();

  const [search, setSearch]           = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast]             = useState(null);
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(DEFAULT_PAGE_SIZE);

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.item_code.toLowerCase().includes(q)
    );
  }, [items, search]);

  // Reset to page 1 when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  // Paginate
  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage    = Math.min(page, totalPages);
  const startIdx    = (safePage - 1) * pageSize;
  const paginated   = filtered.slice(startIdx, startIdx + pageSize);
  const rangeStart  = filtered.length === 0 ? 0 : startIdx + 1;
  const rangeEnd    = Math.min(startIdx + pageSize, filtered.length);

  // Stats
  const totalItems  = items.length;
  const totalUnits  = items.reduce((s, i) => s + i.quantity, 0);
  const lowStock    = items.filter((i) => i.quantity <= 30 && i.quantity > 0).length;
  const outOfStock  = items.filter((i) => i.quantity === 0).length;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleWithdraw = async (qty) => {
    const result = await withdraw({
      itemId:    selectedItem.id,
      quantity:  qty,
      userId:    user.id,
      userEmail: user.email,
    });
    if (!result.error) {
      setSelectedItem(null);
      showToast(`Withdrew ${qty}× ${selectedItem.name} successfully.`);
    }
    return result;
  };

  return (
    <div className="dashboard-root">
      <Navbar />

      <main className="dashboard-main">
        {/* Page header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Inventory</h1>
            <p className="dashboard-subtitle">Warehouse stock overview &amp; withdrawals</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="stats-row">
          <StatCard label="ITEM TYPES"   value={totalItems} />
          <StatCard label="TOTAL UNITS"  value={totalUnits} />
          <StatCard label="LOW STOCK"    value={lowStock}   accent={lowStock > 0 ? 'warn' : undefined} />
          <StatCard label="OUT OF STOCK" value={outOfStock} accent={outOfStock > 0 ? 'danger' : undefined} />
        </div>

        {/* Toolbar */}
        <div className="dashboard-toolbar">
          <SearchBar value={search} onChange={handleSearch} />
          <span className="dashboard-count">
            {filtered.length === 0
              ? 'No results'
              : `${rangeStart}–${rangeEnd} of ${filtered.length} items`}
          </span>
        </div>

        {/* Table */}
        {loading && (
          <div className="dashboard-loading">
            <span className="loading-spinner" />
            LOADING INVENTORY...
          </div>
        )}
        {error && <div className="dashboard-error">! {error}</div>}
        {!loading && !error && (
          <>
            <ItemTable items={paginated} onWithdraw={setSelectedItem} />
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </main>

      {selectedItem && (
        <WithdrawModal
          item={selectedItem}
          onConfirm={handleWithdraw}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {toast && (
        <div className={"dashboard-toast " + (toast.type === 'success' ? 'toast--success' : 'toast--error')}>
          {toast.type === 'success' ? '✓' : '!'} {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={"stat-card" + (accent ? " stat-card--" + accent : "")}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}