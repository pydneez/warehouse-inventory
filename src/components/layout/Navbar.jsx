import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { displayName, isAdmin, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { label: 'INVENTORY', path: '/dashboard' },
    ...(isAdmin ? [{ label: 'ADMIN', path: '/admin' }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
        <span className="navbar-logo-icon">⬡</span>
        <span className="navbar-logo-text">WAREHOUSEIQ</span>
      </div>

      <ul className="navbar-links">
        {navLinks.map((link) => (
          <li key={link.path}>
            <button
              className={"navbar-link" + (location.pathname === link.path ? " navbar-link--active" : "")}
              onClick={() => navigate(link.path)}
            >
              {link.label}
              {location.pathname === link.path && (
                <span className="navbar-link-indicator" />
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar-user">
        <div className="navbar-user-info">
          <span className="navbar-user-label">LOGGED IN AS</span>
          <span className="navbar-user-name">{displayName}</span>
          {isAdmin && <span className="navbar-admin-badge">ADMIN</span>}
        </div>
        <button
          className="navbar-signout"
          onClick={handleSignOut}
          disabled={loggingOut}
        >
          {loggingOut ? '...' : 'SIGN OUT'}
        </button>
      </div>
    </nav>
  );
}
