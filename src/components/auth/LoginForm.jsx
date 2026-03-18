import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './AuthForm.css';

const ALLOWED_DOMAIN = 'warehouse.com';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validateDomain = (email) => {
    const domain = email.split('@')[1];
    return domain === ALLOWED_DOMAIN;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateDomain(email)) {
      setError(`Access denied. Only @${ALLOWED_DOMAIN} accounts are permitted.`);
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="auth-card">
      {/* Card header */}
      <div className="auth-card-header">
        <div className="auth-card-eyebrow">
          <span className="auth-card-line" />
          <span>EMPLOYEE ACCESS</span>
          <span className="auth-card-line" />
        </div>
        <h1 className="auth-card-title">Sign In</h1>
        <p className="auth-card-sub">Authorized personnel only</p>
      </div>

      {/* Form */}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="login-email">
            <span className="auth-label-tag">01</span> EMAIL ADDRESS
          </label>
          <div className="auth-input-wrap">
            <input
              id="login-email"
              className="auth-input"
              type="email"
              autoComplete="email"
              placeholder={`employee@${ALLOWED_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="auth-input-corner auth-input-corner--tl" />
            <span className="auth-input-corner auth-input-corner--br" />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="login-password">
            <span className="auth-label-tag">02</span> PASSWORD
          </label>
          <div className="auth-input-wrap">
            <input
              id="login-password"
              className="auth-input"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-toggle-pass"
              onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? '⊗' : '⊕'}
            </button>
            <span className="auth-input-corner auth-input-corner--tl" />
            <span className="auth-input-corner auth-input-corner--br" />
          </div>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <span className="auth-error-icon">!</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="auth-btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="auth-btn-loading">
              <span className="auth-spinner" />
              AUTHENTICATING...
            </span>
          ) : (
            'ACCESS SYSTEM →'
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="auth-card-footer">
        <span className="auth-card-footer-text">No account yet?</span>
        <Link to="/signup" className="auth-link">Request Access</Link>
      </div>

      {/* Decorative corner marks */}
      <span className="auth-card-corner auth-card-corner--tl" />
      <span className="auth-card-corner auth-card-corner--tr" />
      <span className="auth-card-corner auth-card-corner--bl" />
      <span className="auth-card-corner auth-card-corner--br" />
    </div>
  );
}
