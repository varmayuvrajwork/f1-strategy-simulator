import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-mark">APEX</span>
          <span className="footer-divider">/</span>
          <span className="footer-tag">F1 Strategy Simulator Engine</span>
        </div>
        <div className="footer-meta">
          <span>2026 SEASON</span>
          <span className="footer-dot" />
          <span>24 ROUNDS</span>
          <span className="footer-dot" />
          <span>11 CONSTRUCTORS</span>
        </div>
      </div>
    </footer>
  )
}
