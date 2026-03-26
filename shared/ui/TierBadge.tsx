interface TierBadgeProps {
  tier: 'FOUNDATION' | 'SENIOR' | 'MASTER'
  className?: string
}

const TIER = {
  FOUNDATION: { label: 'Foundation', color: 'var(--text-muted)',   bg: 'var(--bg-raised)' },
  SENIOR:     { label: 'Senior',     color: '#92713A',              bg: '#FBF5EA' },
  MASTER:     { label: 'Master',     color: 'var(--gold)',          bg: 'rgba(196,150,74,0.1)' },
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const t = TIER[tier]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[0.65rem] font-medium ${className}`}
      style={{ background: t.bg, color: t.color }}>
      {t.label}
    </span>
  )
}
