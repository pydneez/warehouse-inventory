import { useEffect, useRef } from 'react';
import './AuthLayout.css';

const GRID_COLS = 12;
const GRID_ROWS = 8;

export default function AuthLayout({ children }) {
  const canvasRef = useRef(null);

  // Subtle animated grid-dot background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = 40;
      const rows = 28;
      const spacingX = canvas.width / cols;
      const spacingY = canvas.height / rows;

      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const x = c * spacingX;
          const y = r * spacingY;
          const dist = Math.sqrt(
            Math.pow(c - cols / 2, 2) + Math.pow(r - rows / 2, 2)
          );
          const pulse = 0.3 + 0.2 * Math.sin(t * 0.02 - dist * 0.3);
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 146, 60, ${pulse * 0.25})`;
          ctx.fill();
        }
      }
      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', draw);
    };
  }, []);

  return (
    <div className="auth-root">
      <canvas ref={canvasRef} className="auth-canvas" />

      {/* Top bar */}
      <header className="auth-topbar">
        <div className="auth-topbar-logo">
          <span className="auth-logo-icon">⬡</span>
          <span className="auth-logo-text">WAREHOUSEIQ</span>
        </div>
        <div className="auth-topbar-badge">EMPLOYEE PORTAL</div>
      </header>

      {/* Decorative vertical lines */}
      <div className="auth-deco-line auth-deco-line--left" />
      <div className="auth-deco-line auth-deco-line--right" />

      {/* Main content */}
      <main className="auth-main">
        {children}
      </main>

      {/* Bottom status bar */}
      <footer className="auth-footer">
        <span className="auth-footer-item">SYS STATUS: <span className="auth-status-ok">ONLINE</span></span>
        <span className="auth-footer-sep">|</span>
        <span className="auth-footer-item">ACCESS: RESTRICTED — @warehouse.com ONLY</span>
        <span className="auth-footer-sep">|</span>
        <span className="auth-footer-item">v2.4.1</span>
      </footer>
    </div>
  );
}
