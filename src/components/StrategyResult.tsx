import type { SimulationEngineResult, StintPlan } from '../lib/simulationEngine'
import Chip from './Chip'
import { Cloud, CloudRain, Sun, Thermometer, Droplets, Activity, Flag, Save, RotateCcw } from 'lucide-react'
import './StrategyResult.css'

interface Props {
  result: SimulationEngineResult
  onSave: () => void
  onReset: () => void
  saved: boolean
  saving: boolean
}

const compoundColor = (compound: string): string => {
  const map: Record<string, string> = {
    C1: '#e8e8e8',
    C2: '#f5d20a',
    C3: '#e0e0e0',
    C4: '#22d3ee',
    C5: '#ff4d4d',
    Intermediate: '#4ade80',
    Wet: '#3b82f6',
  }
  return map[compound] ?? '#888'
}

export default function StrategyResult({ result, onSave, onReset, saved, saving }: Props) {
  const { drivers, weather, laps, circuit_modifier, car_wear_multiplier, circuit_name, team_name } = result
  const airTemp = weather.air_temperature ?? weather.temperature_celsius ?? 25
  const trackTemp = weather.track_temperature ?? airTemp + 12
  const rainfall = weather.rainfall_mm ?? 0
  const condition = weather.condition ?? 'Clear'
  const isWet = condition.toLowerCase().includes('rain') || rainfall > 0.5

  const WeatherIcon = isWet ? CloudRain : condition.toLowerCase().includes('cloud') ? Cloud : Sun

  return (
    <div className="strategy-result">
      <div className="result-head">
        <div>
          <span className="result-eyebrow"><Flag size={14} /> STRATEGY DEPLOYED</span>
          <h2 className="result-title">{circuit_name}</h2>
          <span className="result-team">{team_name} · {laps} LAPS</span>
        </div>
        <div className="result-actions">
          <button className="result-btn save" onClick={onSave} disabled={saving || saved}>
            <Save size={15} />
            {saved ? 'SAVED' : saving ? 'SAVING…' : 'SAVE RUN'}
          </button>
          <button className="result-btn reset" onClick={onReset}>
            <RotateCcw size={15} /> NEW RUN
          </button>
        </div>
      </div>

      <div className="result-stats-row">
        <div className="result-stat">
          <WeatherIcon size={16} />
          <div>
            <span className="result-stat-num">{condition}</span>
            <span className="result-stat-label">Condition</span>
          </div>
        </div>
        <div className="result-stat">
          <Thermometer size={16} />
          <div>
            <span className="result-stat-num">{Math.round(trackTemp)}°C</span>
            <span className="result-stat-label">Track Surface</span>
          </div>
        </div>
        <div className="result-stat">
          <Droplets size={16} />
          <div>
            <span className="result-stat-num">{rainfall.toFixed(1)} mm</span>
            <span className="result-stat-label">Rainfall</span>
          </div>
        </div>
        <div className="result-stat">
          <Activity size={16} />
          <div>
            <span className="result-stat-num">{circuit_modifier.toFixed(2)}×</span>
            <span className="result-stat-label">Wear Modifier</span>
          </div>
        </div>
      </div>

      <div className="result-drivers">
        {drivers.map((d) => (
          <DriverStrategyCard key={d.driver_id} driver={d} laps={laps} carWearMult={car_wear_multiplier} />
        ))}
      </div>

      <details className="result-report">
        <summary>Full Strategy Report (markdown)</summary>
        <pre>{result.strategy_output}</pre>
      </details>
    </div>
  )
}

function DriverStrategyCard({ driver, laps, carWearMult }: { driver: SimulationEngineResult['drivers'][number]; laps: number; carWearMult: number }) {
  return (
    <div className="driver-card card">
      <div className="driver-card-head">
        <div className="driver-card-id">
          <span className="driver-card-code">{driver.driver_id}</span>
          <div>
            <span className="driver-card-name">{driver.driver_name}</span>
            <span className="driver-card-meta">{driver.pitstops} PITSTOPS · {driver.stints.length} STINTS</span>
          </div>
        </div>
        <div className="driver-card-ratings">
          <span className="mini-rating">PACE <strong>{driver.pace}</strong></span>
          <span className="mini-rating">TIRE <strong>{driver.tire_management}</strong></span>
        </div>
      </div>

      <StintTimeline stints={driver.stints} laps={laps} />

      <div className="driver-card-stints">
        {driver.stints.map((s) => (
          <div key={s.stint_number} className="stint-row">
            <span className="stint-compound-dot" style={{ background: compoundColor(s.compound) }} />
            <span className="stint-label">Stint {s.stint_number}</span>
            <span className="stint-laps">L{s.lap_start}–L{s.lap_end}</span>
            <span className="stint-count">{s.laps} laps</span>
            <Chip label={s.compound} color={compoundColor(s.compound)} variant="outline" />
          </div>
        ))}
      </div>

      <p className="driver-card-rationale">{driver.rationale}</p>
      <p className="driver-card-foot">Car wear multiplier ×{carWearMult}</p>
    </div>
  )
}

function StintTimeline({ stints, laps }: { stints: StintPlan[]; laps: number }) {
  return (
    <div className="stint-timeline">
      <div className="stint-timeline-track">
        {stints.map((s) => {
          const leftPct = ((s.lap_start - 1) / laps) * 100
          const widthPct = (s.laps / laps) * 100
          return (
            <div
              key={s.stint_number}
              className="stint-timeline-seg"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                background: `${compoundColor(s.compound)}33`,
                borderColor: compoundColor(s.compound),
              }}
              title={`${s.compound} · L${s.lap_start}–L${s.lap_end}`}
            />
          )
        })}
      </div>
      <div className="stint-timeline-axis">
        <span>L1</span>
        <span>L{laps}</span>
      </div>
    </div>
  )
}
