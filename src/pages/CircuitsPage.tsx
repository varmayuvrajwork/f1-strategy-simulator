import { useState } from 'react'
import { circuits as allCircuits, countryFlag, stressColor, abrasionColor, tireCompounds } from '../data/reference'
import Chip from '../components/Chip'
import { Flag, MapPin, Repeat, Gauge, ChevronDown } from 'lucide-react'
import './CircuitsPage.css'

export default function CircuitsPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">2026 CALENDAR · 24 ROUNDS</span>
        <h1 className="page-title">Circuit <span className="accent">Atlas</span></h1>
        <p className="page-subtitle">Every track on the 2026 schedule with tire stress, asphalt abrasion, and downforce demand — the inputs the strategy engine uses to model wear.</p>
      </div>

      <div className="circuits-grid">
        {allCircuits.map((c) => {
          const open = openId === c.id
          return (
            <div key={c.id} className={`circuit-card card ${open ? 'open' : ''}`}>
              <button className="circuit-card-head" onClick={() => setOpenId(open ? null : c.id)}>
                <span className="circuit-flag">{countryFlag(c.country)}</span>
                <div className="circuit-card-title">
                  <span className="circuit-name">{c.name}</span>
                  <span className="circuit-loc"><MapPin size={11} /> {c.city}, {c.country}</span>
                </div>
                <ChevronDown size={16} className={`circuit-chev ${open ? 'rot' : ''}`} />
              </button>

              <div className="circuit-card-meta">
                <span><Repeat size={12} /> {c.laps} LAPS</span>
                <span><Gauge size={12} /> {c.layout_type}</span>
              </div>

              <div className="circuit-card-tags">
                <Chip label={`Stress · ${c.tire_stress}`} color={stressColor(c.tire_stress)} variant="dot" />
                <Chip label={`Abrasion · ${c.asphalt_abrasion}`} color={abrasionColor(c.asphalt_abrasion)} variant="dot" />
                <Chip label={`DF · ${c.downforce_level}`} variant="dot" />
              </div>

              {open && (
                <div className="circuit-card-detail">
                  <span className="detail-label">Tire Compound Reference</span>
                  <div className="compound-strip">
                    {tireCompounds.map((t) => (
                      <div key={t.compound} className="compound-chip">
                        <span className="compound-swatch" style={{ background: compoundColor(t.compound) }} />
                        <span className="compound-code">{t.compound}</span>
                        <span className="compound-deg">{t.degradation_rate}/lap</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function compoundColor(compound: string): string {
  const map: Record<string, string> = {
    C1: '#e8e8e8', C2: '#f5d20a', C3: '#e0e0e0', C4: '#22d3ee', C5: '#ff4d4d',
    Intermediate: '#4ade80', Wet: '#3b82f6',
  }
  return map[compound] ?? '#888'
}
