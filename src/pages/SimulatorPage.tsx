import { useState } from 'react'
import Hero from '../components/Hero'
import SimulatorForm from '../components/SimulatorForm'
import StrategyResult from '../components/StrategyResult'
import { circuits, teams } from '../data/reference'
import { runSimulationEngine, type SimulationEngineResult } from '../lib/simulationEngine'
import { supabase } from '../lib/supabase'
import { AlertTriangle } from 'lucide-react'
import './SimulatorPage.css'

function simulateWeather(raceId: string): {
  condition: string
  air_temperature: number
  track_temperature: number
  rainfall_mm: number
  rain_probability: number
  humidity: number
} {
  // Deterministic pseudo-weather keyed on raceId for variety across circuits.
  const circuit = circuits.find((c) => c.id === raceId)
  const seed = raceId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const air = 16 + (seed % 22) // 16–37°C
  const track = air + 10 + (seed % 6)
  const rainy = (seed % 7) === 0
  const condition = rainy ? 'Rain' : (seed % 3 === 0 ? 'Clouds' : 'Clear')
  const rainfall = rainy ? 1 + (seed % 6) : 0
  return {
    condition,
    air_temperature: air,
    track_temperature: track,
    rainfall_mm: rainfall,
    rain_probability: rainy ? 0.7 : 0.08 + (seed % 5) / 100,
    humidity: 40 + (seed % 40),
  }
}

export default function SimulatorPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationEngineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleRun = (raceId: string, teamId: string) => {
    setLoading(true)
    setError(null)
    setSaved(false)
    setResult(null)
    // Brief delay to surface the loading state / "AI computing" feel.
    setTimeout(() => {
      const weather = simulateWeather(raceId)
      const res = runSimulationEngine(raceId, teamId, weather)
      if ('error' in res) {
        setError(res.error)
      } else {
        setResult(res)
      }
      setLoading(false)
    }, 650)
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    const { weather, circuit_name, team_name } = result
    const { error } = await supabase.from('simulations').insert({
      race_id: circuits.find((c) => c.name === circuit_name)?.id ?? '',
      team_id: teams.find((t) => t.name === team_name)?.id ?? '',
      circuit_name,
      team_name,
      weather_condition: weather.condition ?? 'Clear',
      air_temperature: weather.air_temperature ?? weather.temperature_celsius ?? null,
      track_temperature: weather.track_temperature ?? null,
      rainfall_mm: weather.rainfall_mm ?? null,
      strategy_output: result.strategy_output,
    })
    setSaving(false)
    if (!error) setSaved(true)
    else setError(error.message)
  }

  const handleReset = () => {
    setResult(null)
    setSaved(false)
    setError(null)
  }

  return (
    <div className="simulator-page">
      <Hero />

      <section className="simulator-workspace">
        <div className="simulator-grid">
          <div className="simulator-left">
            <SimulatorForm circuits={circuits} teams={teams} onSubmit={handleRun} loading={loading} />
          </div>

          <div className="simulator-right">
            {error && (
              <div className="sim-error">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div className="sim-loading">
                <div className="sim-loading-grid" aria-hidden="true" />
                <div className="sim-loading-content">
                  <span className="sim-loading-spinner" />
                  <span className="sim-loading-text">RUNNING STRATEGY ENGINE</span>
                  <span className="sim-loading-sub">Computing tire degradation curves · modeling weather physics · building driver stint plans</span>
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="sim-placeholder">
                <div className="sim-placeholder-icon">
                  <svg viewBox="0 0 64 64" width="48" height="48">
                    <path d="M20 46 L32 18 L44 46" stroke="var(--red-400)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="32" cy="34" r="3" fill="var(--red-400)" />
                  </svg>
                </div>
                <h3>Awaiting Strategy Input</h3>
                <p>Pick a circuit and constructor, then generate a race strategy. Driver-differentiated stint plans, pitstop counts, and tire compound selections will appear here.</p>
              </div>
            )}

            {!loading && result && (
              <StrategyResult result={result} onSave={handleSave} onReset={handleReset} saved={saved} saving={saving} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
