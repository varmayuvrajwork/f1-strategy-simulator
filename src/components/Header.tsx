import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Gauge, Flag, Users, Calendar, History } from 'lucide-react'
import './Header.css'

const navItems = [
  { to: '/', label: 'Simulate', icon: Gauge, end: true },
  { to: '/circuits', label: 'Circuits', icon: Flag },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/history', label: 'History', icon: History },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleSimulateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
    }
    setTimeout(() => {
      const el = document.getElementById('simulator-workspace')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' })
      }
    }, 50)
  }

  return (
    <header className="site-header">
      <div className="header-bg-streak" aria-hidden="true" />
      <div className="header-inner">
        <Link to="/" className="brand">
          <div className="brand-mark" title="Apex F1 Strategy Engine">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-svg">
              {/* Rear Wing Assembly */}
              <rect x="6" y="21" width="6" height="22" rx="1" fill="currentColor" />
              <rect x="10" y="27" width="10" height="10" rx="1" fill="currentColor" />
              {/* Aerodynamic Body Chassis & Nose Cone */}
              <path d="M14 26C20 26 26 24 33 24C41 24 49 26 56 30C58 31 58 33 56 34C49 38 41 40 33 40C26 40 20 38 14 38Z" fill="currentColor" />
              {/* Front Wing Assembly */}
              <path d="M52 24L60 31V33L52 40V37L57 32L52 27V24Z" fill="currentColor" />
              {/* Wheels */}
              <rect x="16" y="15" width="10" height="7" rx="2" fill="#0A0E1A" stroke="currentColor" strokeWidth="1.5" />
              <rect x="16" y="42" width="10" height="7" rx="2" fill="#0A0E1A" stroke="currentColor" strokeWidth="1.5" />
              <rect x="42" y="18" width="9" height="6" rx="2" fill="#0A0E1A" stroke="currentColor" strokeWidth="1.5" />
              <rect x="42" y="40" width="9" height="6" rx="2" fill="#0A0E1A" stroke="currentColor" strokeWidth="1.5" />
              {/* Cockpit Halo Center */}
              <circle cx="33" cy="32" r="3.5" fill="#0A0E1A" stroke="currentColor" strokeWidth="1.5" />
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
                onClick={item.to === '/' ? handleSimulateClick : undefined}
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
