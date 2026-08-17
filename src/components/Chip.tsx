import './Chip.css'

interface Props {
  label: string
  color?: string
  variant?: 'solid' | 'outline' | 'dot'
}

export default function Chip({ label, color = 'var(--red-400)', variant = 'solid' }: Props) {
  if (variant === 'dot') {
    return (
      <span className="chip chip-dot">
        <span className="chip-dot-mark" style={{ background: color }} />
        {label}
      </span>
    )
  }
  if (variant === 'outline') {
    return (
      <span className="chip chip-outline" style={{ color, borderColor: color }}>
        {label}
      </span>
    )
  }
  return (
    <span className="chip" style={{ background: `${color}22`, color, borderColor: `${color}55` }}>
      {label}
    </span>
  )
}
