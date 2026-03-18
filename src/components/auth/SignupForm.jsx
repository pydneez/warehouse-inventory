import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './AuthForm.css';

const ALLOWED_DOMAIN = 'warehouse.com';

const STRENGTH_LEVELS = [
  { label: 'WEAK',   color: '#f87171' },
  { label: 'FAIR',   color: '#fb923c' },
  { label: 'GOOD',   color: '#facc15' },
  { label: 'STRONG', color: '#4ade80' },
];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)             score++;
  if (/[A-Z]/.test(password))           score++;
  if (/[0-9]/.test(password))           score++;
  if (/[^A-Za-z0-9]/.test(password))    score++;
  return score; // 0–4
}

export default function SignupForm() {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const strengthScore = getPasswordStrength(password);
  const strengthInfo  = STRENGTH_LEVELS[Math.max(0, strengthScore - 1)];

  const validateDomain = (email) => {
    const domain = email.split('@')[1];
    return domain === ALLOWED_DOMAIN;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateDomain(email)) {
      setError(`Only @${ALLOWED_DOMAIN} email addresses may register.`);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="auth-card auth-card--success">
        <div className="auth-success-icon">✓</div>
        <h2 className="auth-success-title">Registration Submitted</h2>
        <p className="auth-success-body">
          A confirmation link has been sent to <strong>{email}</strong>.
          Please verify your address to activate your account.
        </p>
        <Link to="/login" className="auth-btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1.5rem' }}>
          BACK TO SIGN IN
        </Link>
        <span className="auth-card-corner auth-card-corner--tl" />
        <span className="auth-card-corner auth-card-corner--tr" />
        <span className="auth-card-corner auth-card-corner--bl" />
        <span className="auth-card-corner auth-card-corner--br" />
      </div>
    );
  }

  return (
    <div className="auth-card">
      {/* Card header */}
      <div className="auth-card-header">
        <div className="auth-card-eyebrow">
          <span className="auth-card-line" />
          <span>NEW EMPLOYEE</span>
          <span className="auth-card-line" />
        </div>
        <h1 className="auth-card-title">Register</h1>
        <p className="auth-card-sub">Create your warehouse account</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-name">
            <span className="auth-label-tag">01</span> FULL NAME
          </label>
          <div className="auth-input-wrap">
            <input
              id="signup-name"
              className="auth-input"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <span className="auth-input-corner auth-input-corner--tl" />
            <span className="auth-input-corner auth-input-corner--br" />
          </div>
        </div>

        {/* Email */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-email">
            <span className="auth-label-tag">02</span> WORK EMAIL
          </label>
          <div className="auth-input-wrap">
            <input
              id="signup-email"
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
          <p className="auth-field-hint">Must be a @{ALLOWED_DOMAIN} address</p>
        </div>

        {/* Password */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-password">
            <span className="auth-label-tag">03</span> PASSWORD
          </label>
          <div className="auth-input-wrap">
            <input
              id="signup-password"
              className="auth-input"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
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

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="auth-strength">
              <div className="auth-strength-bars">
                {[1, 2, 3, 4].map((lvl) => (
                  <span
                    key={lvl}
                    className="auth-strength-bar"
                    style={{
                      background: strengthScore >= lvl ? strengthInfo.color : undefined,
                      opacity: strengthScore >= lvl ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>
              <span
                className="auth-strength-label"
                style={{ color: strengthInfo.color }}
              >
                {strengthInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-confirm">
            <span className="auth-label-tag">04</span> CONFIRM PASSWORD
          </label>
          <div className="auth-input-wrap">
            <input
              id="signup-confirm"
              className="auth-input"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm.length > 0 && (
              <span
                className="auth-match-indicator"
                style={{ color: confirm === password ? 'var(--clr-success)' : 'var(--clr-error)' }}
              >
                {confirm === password ? '✓' : '✗'}
              </span>
            )}
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

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? (
            <span className="auth-btn-loading">
              <span className="auth-spinner" />
              REGISTERING...
            </span>
          ) : (
            'CREATE ACCOUNT →'
          )}
        </button>
      </form>

      <div className="auth-card-footer">
        <span className="auth-card-footer-text">Already have access?</span>
        <Link to="/login" className="auth-link">Sign In</Link>
      </div>

      <span className="auth-card-corner auth-card-corner--tl" />
      <span className="auth-card-corner auth-card-corner--tr" />
      <span className="auth-card-corner auth-card-corner--bl" />
      <span className="auth-card-corner auth-card-corner--br" />
    </div>
  );
}
