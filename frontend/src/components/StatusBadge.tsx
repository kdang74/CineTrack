import type { WatchStatus } from '../types'

const STATUS_CONFIG: Record<WatchStatus, { label: string; classes: string }> = {
  Watchlist: { label: 'Want to Watch', classes: 'bg-blue-900/60 text-blue-300 border border-blue-800' },
  Watching:  { label: 'Watching',      classes: 'bg-yellow-900/60 text-yellow-300 border border-yellow-800' },
  Watched:   { label: 'Watched',       classes: 'bg-green-900/60 text-green-300 border border-green-800' },
  Dropped:   { label: 'Dropped',       classes: 'bg-red-900/60 text-red-300 border border-red-800' },
}

export default function StatusBadge({ status }: { status: WatchStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Watchlist
  return (
    <span className={`badge ${config.classes}`} aria-label={`Status: ${config.label}`}>
      {config.label}
    </span>
  )
}
