import { ArrowRight, Cpu, CloudRain, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Hero.css'

const HERO_IMG = 'https://images.pexels.com/photos/28680795/pexels-photo-28680795.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-media" style={{ backgroundImage: `url(${HERO_IMG})` }} aria-hidden="true" />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-content">
        <span className="hero-eyebrow">
          <span className="hero-live-dot" />
          2026 SEASON · MULTI-AGENT STRATEGY ENGINE
        </span>
        <h1 className="hero-title">
          ENGINEER THE<br />
          <span className="hero-title-accent">PERFECT PIT WALL.</span>
        </h1>
        <p className="hero-sub">
          AI-modeled tire degradation, track-weather physics, and driver-differentiated
          stint plans for every round of the 2026 Formula 1 calendar.
        </p>

        <div className="hero-cta-row">
          <a
            href="#simulator-workspace"
            className="hero-cta primary"
            onClick={(e) => {
              e.preventDefault()
              const el = document.getElementById('simulator-workspace')
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            Start a Simulation
            <ArrowRight size={18} strokeWidth={2.4} />
          </a>
          <Link to="/calendar" className="hero-cta ghost">
            View 2026 Calendar
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <Cpu size={16} />
            <div>
              <span className="hero-stat-num">7</span>
              <span className="hero-stat-label">Tire Compounds</span>
            </div>
          </div>
          <div className="hero-stat">
            <CloudRain size={16} />
            <div>
              <span className="hero-stat-num">24</span>
              <span className="hero-stat-label">Circuits</span>
            </div>
          </div>
          <div className="hero-stat">
            <Timer size={16} />
            <div>
              <span className="hero-stat-num">22</span>
              <span className="hero-stat-label">Drivers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
