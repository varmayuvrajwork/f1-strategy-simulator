import { useEffect, useState } from 'react'
import { fetchSavedSimulations, deleteSimulationRun } from '../lib/storage'
import type { SavedSimulation } from '../types'
import Chip from '../components/Chip'
import { History, Trash2, ChevronRight, Calendar, CloudRain, Thermometer, X } from 'lucide-react'
import './HistoryPage.css'

export default function HistoryPage() {
  const [runs, setRuns] = useState<SavedSimulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<SavedSimulation | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await fetchSavedSimulations()
    if (error) {
      setError(error)
    } else {
      setRuns(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    await deleteSimulationRun(id)
    setRuns((r) => r.filter((row) => row.id !== id))
    if (active?.id === id) setActive(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">SAVED RUNS · PIT WALL ARCHIVE</span>
        <h1 className="page-title">Strategy <span className="accent">History</span></h1>
        <p className="page-subtitle">Every strategy you've generated and saved, stored to your project database. Open a run to review the full stint plan, or clear old ones from the archive.</p>
      </div>

      {loading && <div className="empty-state">Loading saved runs…</div>}
      {error && <div className="empty-state">Failed to load: {error}</div>}
      {!loading && !error && runs.length === 0 && (
        <div className="empty-state">
          <History size={28} />
          <p style={{ marginTop: 12 }}>No saved runs yet. Generate a strategy on the Simulate page and hit Save Run.</p>
        </div>
      )}

      {runs.length > 0 && (
        <div className="history-grid">
          <div className="history-list">
            {runs.map((run) => (
              <button
                key={run.id}
                className={`history-row ${active?.id === run.id ? 'active' : ''}`}
                onClick={() => setActive(run)}
              >
                <div className="history-row-main">
                  <span className="history-row-circuit">{run.circuit_name}</span>
                  <span className="history-row-team">{run.team_name}</span>
                  <div className="history-row-meta">
                    <span><Calendar size={10} /> {new Date(run.created_at).toLocaleDateString()}</span>
                    {run.weather_condition && <Chip label={run.weather_condition} variant="dot" />}
                  </div>
                </div>
                <div className="history-row-actions">
                  <ChevronRight size={15} />
                </div>
              </button>
            ))}
          </div>

          <div className="history-detail">
            {active ? (
              <>
                <div className="history-detail-head">
                  <div>
                    <span className="history-detail-circuit">{active.circuit_name}</span>
                    <span className="history-detail-team">{active.team_name}</span>
                  </div>
                  <div className="history-detail-actions">
                    <button className="history-del-btn" onClick={() => handleDelete(active.id)}>
                      <Trash2 size={14} /> DELETE
                    </button>
                    <button className="history-close-btn" onClick={() => setActive(null)}>
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="history-detail-stats">
                  <div className="hist-stat">
                    <CloudRain size={14} />
                    <span>{active.weather_condition ?? '—'}</span>
                  </div>
                  <div className="hist-stat">
                    <Thermometer size={14} />
                    <span>{active.track_temperature ? `${Math.round(active.track_temperature)}°C` : '—'}</span>
                  </div>
                  <div className="hist-stat">
                    <Calendar size={14} />
                    <span>{new Date(active.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <pre className="history-detail-output">{active.strategy_output}</pre>
              </>
            ) : (
              <div className="history-detail-empty">
                <History size={32} />
                <p>Select a saved run to review its full strategy report.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
