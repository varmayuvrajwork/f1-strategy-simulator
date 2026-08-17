import { Link, NavLink } from 'react-router-dom'
import { Gauge, Flag, Users, Calendar, Radio, History } from 'lucide-react'
import './Header.css'

const navItems = [
  { to: '/', label: 'Simulate', icon: Gauge, end: true },
  { to: '/circuits', label: 'Circuits', icon: Flag },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/history', label: 'History', icon: History },
]

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-bg-streak" aria-hidden="true" />
      <div className="header-inner">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 64 64" className="brand-svg">
              <path d="M20 46 L32 18 L44 46" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="32" cy="34" r="3" fill="currentColor" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">APEX</span>
            <span className="brand-sub">F1 STRATEGY ENGINE</span>
          </div>
        </Link>

        <nav className="site-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} strokeWidth={2.2} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
