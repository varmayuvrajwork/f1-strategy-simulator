import { useState } from 'react'
import { driversByTeam, carByTeam, teamAccent, countryFlag } from '../data/reference'
import type { Circuit, Team } from '../types'
import { ChevronDown, Flag, Users, Zap, Gauge } from 'lucide-react'
import './SimulatorForm.css'

interface Props {
  circuits: Circuit[]
  teams: Team[]
  onSubmit: (raceId: string, teamId: string) => void
  loading: boolean
}

export default function SimulatorForm({ circuits, teams, onSubmit, loading }: Props) {
  const [raceId, setRaceId] = useState('monaco')
  const [teamId, setTeamId] = useState('ferrari')

  const circuit = circuits.find((c) => c.id === raceId)
  const team = teams.find((t) => t.id === teamId)
  const accent = teamAccent(teamId)
  const car = carByTeam(teamId)
  const drivers = driversByTeam(teamId)

  return (
    <div className="sim-form card">
      <div className="sim-form-head">
        <span className="sim-form-eyebrow">
          <Gauge size={14} /> STRATEGY CONSOLE
        </span>
        <h2 className="sim-form-title">Configure Run</h2>
      </div>

      <div className="sim-form-grid">
        <label className="sim-field">
          <span className="sim-field-label"><Flag size={13} /> Circuit</span>
          <div className="select-wrap">
            <select value={raceId} onChange={(e) => setRaceId(e.target.value)}>
              {circuits.map((c) => (
                <option key={c.id} value={c.id}>{c.name} · {c.country}</option>
              ))}
            </select>
            <ChevronDown size={16} className="select-chev" />
          </div>
        </label>

        <label className="sim-field">
          <span className="sim-field-label"><Users size={13} /> Constructor</span>
          <div className="select-wrap">
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="select-chev" />
          </div>
        </label>
      </div>

      {circuit && team && car && (
        <div className="sim-preview">
          <div className="sim-preview-circuit">
            <span className="sim-flag">{countryFlag(circuit.country)}</span>
            <div>
              <span className="sim-preview-name">{circuit.name}</span>
              <span className="sim-preview-meta">{circuit.laps} LAPS · {circuit.layout_type.toUpperCase()} · {circuit.downforce_level.toUpperCase()} DOWNFORCE</span>
            </div>
          </div>

          <div className="sim-preview-team" style={{ borderLeftColor: accent }}>
            <div className="sim-team-head">
              <span className="sim-team-bar" style={{ background: accent }} />
              <span className="sim-team-name">{team.name}</span>
            </div>
            <div className="sim-team-stats">
              <span><Zap size={11} /> Aero {car.aero_efficiency}</span>
              <span><Gauge size={11} /> DF {car.downforce}</span>
              <span>Wear ×{car.tire_wear_multiplier}</span>
            </div>
          </div>

          <div className="sim-preview-drivers">
            {drivers.map((d) => (
              <div key={d.id} className="sim-driver-pill">
                <span className="sim-driver-code" style={{ background: accent }}>{d.id.toUpperCase()}</span>
                <span className="sim-driver-name">{d.name}</span>
                <span className="sim-driver-ratings">P{d.pace} · TM{d.tire_management}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="sim-run-btn"
        onClick={() => onSubmit(raceId, teamId)}
        disabled={loading}
        style={{ '--btn-accent': accent } as React.CSSProperties}
      >
        {loading ? (
          <>
            <span className="sim-spinner" /> COMPUTING STRATEGY…
          </>
        ) : (
          <>
            <Zap size={17} /> GENERATE RACE STRATEGY
          </>
        )}
      </button>
    </div>
  )
}
