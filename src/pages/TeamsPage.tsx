import { teams, driversByTeam, carByTeam, engineById, teamAccent } from '../data/reference'
import RatingBar from '../components/RatingBar'
import Chip from '../components/Chip'
import { Cog, Wrench, Zap } from 'lucide-react'
import './TeamsPage.css'

export default function TeamsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">2026 GRID · 10 CONSTRUCTORS</span>
        <h1 className="page-title">The <span className="accent">Pit Wall</span></h1>
        <p className="page-subtitle">Constructor profiles, power units, aero efficiency, and the two-driver lineups the strategy engine differentiates stint plans across.</p>
      </div>

      <div className="teams-grid">
        {teams.map((team) => {
          const accent = teamAccent(team.id)
          const car = carByTeam(team.id)
          const engine = engineById(team.engine_id)
          const drivers = driversByTeam(team.id)
          if (!car) return null
          return (
            <div key={team.id} className="team-card card" style={{ '--team-accent': accent } as React.CSSProperties}>
              <div className="team-card-accent" style={{ background: accent }} />
              <div className="team-card-head">
                <div>
                  <span className="team-card-name">{team.name}</span>
                  <span className="team-card-base"><Wrench size={11} /> {team.base}</span>
                </div>
                <span className="team-card-engine">
                  <Cog size={12} />
                  {engine?.name ?? team.engine_id}
                </span>
              </div>

              <div className="team-card-ratings">
                <RatingBar label="Aero Efficiency" value={car.aero_efficiency} color={accent} />
                <RatingBar label="Downforce" value={car.downforce} color={accent} />
              </div>

              <div className="team-card-engine-stats">
                {engine && (
                  <>
                    <span><Zap size={10} /> Power {engine.power_rating}</span>
                    <span>Reliability {engine.reliability_rating}</span>
                    <span>Efficiency {engine.efficiency_rating}</span>
                  </>
                )}
              </div>

              <div className="team-card-drivers">
                {drivers.map((d) => (
                  <div key={d.id} className="team-driver">
                    <span className="team-driver-code" style={{ background: accent }}>{d.id.toUpperCase()}</span>
                    <span className="team-driver-name">{d.name}</span>
                    <div className="team-driver-bars">
                      <RatingBar label="PACE" value={d.pace} color={accent} compact />
                      <RatingBar label="TIRE" value={d.tire_management} color={accent} compact />
                    </div>
                  </div>
                ))}
              </div>

              <div className="team-card-wear">
                <Chip label={`Wear Mult ×${car.tire_wear_multiplier}`} color={accent} variant="outline" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
