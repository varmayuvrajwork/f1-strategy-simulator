import { races, circuitById, countryFlag } from '../data/reference'
import Chip from '../components/Chip'
import { Calendar, Flag, Zap } from 'lucide-react'
import './CalendarPage.css'

export default function CalendarPage() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">2026 SEASON · MARCH → DECEMBER</span>
        <h1 className="page-title">Race <span className="accent">Calendar</span></h1>
        <p className="page-subtitle">The full 24-round 2026 Formula 1 championship schedule, with sprint weekends and circuit destinations marked round by round.</p>
      </div>

      <div className="calendar-list">
        {races.map((race) => {
          const circuit = circuitById(race.circuit_id)
          const isSprint = race.format === 'Sprint'
          const dateObj = new Date(race.date)
          const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase()
          const day = dateObj.getDate()
          return (
            <div key={race.round} className="cal-row">
              <div className="cal-date">
                <span className="cal-month">{month}</span>
                <span className="cal-day">{day}</span>
              </div>

              <div className="cal-round">
                <span className="cal-round-num">R{race.round}</span>
                <span className="cal-round-label">Round</span>
              </div>

              <div className="cal-info">
                <span className="cal-name">{race.name}</span>
                <span className="cal-circuit">
                  <Flag size={11} /> {circuit?.name ?? race.circuit_id} · {circuit?.city}, {circuit?.country}
                </span>
              </div>

              <div className="cal-meta">
                <span className="cal-laps"><Zap size={11} /> {race.laps} LAPS</span>
                {isSprint && <Chip label="SPRINT" color="var(--cyan-400)" />}
                {circuit && <span className="cal-flag-pill">{countryFlag(circuit.country)}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
