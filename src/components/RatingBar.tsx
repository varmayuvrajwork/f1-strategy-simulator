import './RatingBar.css'

interface Props {
  label: string
  value: number
  max?: number
  color?: string
  compact?: boolean
}

export default function RatingBar({ label, value, max = 100, color = 'var(--red-400)', compact }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`rating-bar ${compact ? 'compact' : ''}`}>
      <div className="rating-bar-head">
        <span className="rating-label">{label}</span>
        <span className="rating-value">{value}</span>
      </div>
      <div className="rating-track">
        <div className="rating-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
