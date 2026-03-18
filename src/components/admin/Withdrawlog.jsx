import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

const PAGE_SIZES = [10, 15, 20, 25];
const DEFAULT_PAGE_SIZE = 10;

export default function WithdrawLog() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Filters
  const [searchUser, setSearchUser]   = useState('');
  const [searchItem, setSearchItem]   = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');

  // Pagination
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('withdrawal_logs')
        .select(`
          id,
          quantity,
          user_email,
          withdrawn_at,
          items ( item_code, name )
        `)
        .order('withdrawn_at', { ascending: false });

      if (error) setError(error.message);
      else setLogs(data ?? []);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  // Reset to page 1 on any filter change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchUser('');
    setSearchItem('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = searchUser || searchItem || dateFrom || dateTo;

  // Apply filters
  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const userMatch = !searchUser ||
        log.user_email.toLowerCase().includes(searchUser.toLowerCase());

      const itemMatch = !searchItem || (
        log.items?.name.toLowerCase().includes(searchItem.toLowerCase()) ||
        log.items?.item_code.toLowerCase().includes(searchItem.toLowerCase())
      );

      const logDate = new Date(log.withdrawn_at);
      const fromMatch = !dateFrom || logDate >= new Date(dateFrom + 'T00:00:00');
      const toMatch   = !dateTo   || logDate <= new Date(dateTo   + 'T23:59:59');

      return userMatch && itemMatch && fromMatch && toMatch;
    });
  }, [logs, searchUser, searchItem, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const startIdx   = (safePage - 1) * pageSize;
  const paginated  = filtered.slice(startIdx, startIdx + pageSize);
  const rangeStart = filtered.length === 0 ? 0 : startIdx + 1;
  const rangeEnd   = Math.min(startIdx + pageSize, filtered.length);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (safePage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
  };

  const fmt = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  return (
    <div className="admin-card admin-card--full">
      <div className="admin-card-header">
        <span className="admin-card-eyebrow">AUDIT TRAIL</span>
        <h2 className="admin-card-title">Withdrawal Log</h2>
        <p className="admin-card-sub">
          {hasActiveFilters
            ? `${filtered.length} of ${logs.length} transactions match filters`
            : `${logs.length} total transactions`}
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="log-filters">
        <div className="log-filter-field">
          <label className="log-filter-label">WITHDRAWN BY</label>
          <div className="log-filter-input-wrap">
            <span className="log-filter-icon">@</span>
            <input
              className="log-filter-input"
              type="text"
              placeholder="Search by email..."
              value={searchUser}
              onChange={handleFilterChange(setSearchUser)}
            />
          </div>
        </div>

        <div className="log-filter-field">
          <label className="log-filter-label">ITEM</label>
          <div className="log-filter-input-wrap">
            <span className="log-filter-icon">⊟</span>
            <input
              className="log-filter-input"
              type="text"
              placeholder="Name or item code..."
              value={searchItem}
              onChange={handleFilterChange(setSearchItem)}
            />
          </div>
        </div>

        <div className="log-filter-field">
          <label className="log-filter-label">DATE FROM</label>
          <input
            className="log-filter-input log-filter-date"
            type="date"
            value={dateFrom}
            onChange={handleFilterChange(setDateFrom)}
          />
        </div>

        <div className="log-filter-field">
          <label className="log-filter-label">DATE TO</label>
          <input
            className="log-filter-input log-filter-date"
            type="date"
            value={dateTo}
            onChange={handleFilterChange(setDateTo)}
          />
        </div>

        {hasActiveFilters && (
          <button className="log-clear-btn" onClick={clearFilters}>
            ✕ CLEAR
          </button>
        )}
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="admin-loading">
          <span className="admin-spinner" /> FETCHING LOGS...
        </div>
      )}
      {error && <div className="admin-msg admin-msg--error">! {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="admin-empty">
          {hasActiveFilters ? 'No transactions match the current filters.' : 'No withdrawals recorded yet.'}
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="log-table-wrap">
            <table className="log-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>TIMESTAMP</th>
                  <th>ITEM CODE</th>
                  <th>ITEM NAME</th>
                  <th>QTY</th>
                  <th>WITHDRAWN BY</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log, i) => (
                  <tr key={log.id} className="log-row">
                    <td className="log-td-num">{startIdx + i + 1}</td>
                    <td className="log-td-time">{fmt(log.withdrawn_at)}</td>
                    <td className="log-td-code">{log.items?.item_code ?? '—'}</td>
                    <td className="log-td-name">{log.items?.name ?? '—'}</td>
                    <td className="log-td-qty">{log.quantity}</td>
                    <td className="log-td-user">{log.user_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="log-pagination">
            <div className="log-pagination-size">
              <span className="log-pagination-label">ROWS</span>
              <select
                className="log-pagination-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="log-pagination-controls">
              <button className="log-page-btn" onClick={() => setPage(1)} disabled={safePage === 1}>⟨⟨</button>
              <button className="log-page-btn" onClick={() => setPage((p) => p - 1)} disabled={safePage === 1}>⟨</button>

              {getVisiblePages().map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="log-page-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={"log-page-btn" + (p === safePage ? " log-page-btn--active" : "")}
                    onClick={() => setPage(p)}
                  >{p}</button>
                )
              )}

              <button className="log-page-btn" onClick={() => setPage((p) => p + 1)} disabled={safePage === totalPages}>⟩</button>
              <button className="log-page-btn" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>⟩⟩</button>
            </div>

            <span className="log-pagination-info">
              {rangeStart}–{rangeEnd} of {filtered.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}