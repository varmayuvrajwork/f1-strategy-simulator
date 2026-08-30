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
            <svg viewBox="0 0 64 64" fill="currentColor" className="brand-svg">
              {/* Rear Wing Endplate & DRS Flap */}
              <path d="M6 20H13V23H10V35H13V38H6V20Z" />
              <path d="M9 24H20V27H9V24Z" />
              {/* Main Aero Body & Nose Cone */}
              <path d="M10 32C15 32 20 30 26 30C33 30 40 29 48 31C52 32 57 33 61 33C62.5 33 63 32 62 31.5L56 28.5C49 27.5 41 27.5 33 27.5C25 27.5 16 29.5 10 32Z" />
              {/* Front Wing Assembly */}
              <path d="M52 34L61 34V37.5L52 36V34Z" />
              <path d="M59 31V39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              {/* Cockpit Halo Safety Ring */}
              <path d="M29 24.5C32.5 21 36.5 21 40 24.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Rear Wheel */}
              <circle cx="18" cy="36" r="6.5" />
              <circle cx="18" cy="36" r="3" fill="var(--red-700)" />
              {/* Front Wheel */}
              <circle cx="47" cy="36" r="5.5" />
              <circle cx="47" cy="36" r="2.5" fill="var(--red-700)" />
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
