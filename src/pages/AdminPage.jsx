import { Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import AddItemForm from '../components/admin/AddItemForm';
import UpdateStockForm from '../components/admin/UpdateStockForm';
import WithdrawLog from '../components/admin/WithdrawLog';
import { useAuth } from '../hooks/useAuth';
import { useInventory } from '../hooks/useInventory';
import './AdminPage.css';

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { items, addItem, updateStock }   = useInventory();

  // Guard — non-admins get bounced
  if (!authLoading && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="admin-root">
      <Navbar />

      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Admin Panel</h1>
            <p className="admin-page-sub">Manage inventory and review withdrawal activity</p>
          </div>
          <span className="admin-page-badge">RESTRICTED ACCESS</span>
        </div>

        {/* Top two-col: add + update */}
        <div className="admin-grid">
          <AddItemForm onAdd={addItem} />
          <UpdateStockForm items={items} onUpdate={updateStock} />
        </div>

        {/* Full-width log */}
        <WithdrawLog />
      </main>
    </div>
  );
}