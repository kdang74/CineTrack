import { Link } from 'react-router-dom'
import type { ActivityEvent } from '../types'
import { tmdbPoster } from '../lib/api'
import { Plus, Eye, Star, X, Film } from 'lucide-react'

const ACTION_ICONS: Record<string, React.ReactNode> = {
  added:   <Plus size={12} className="text-blue-400" />,
  watched: <Eye size={12} className="text-green-400" />,
  rated:   <Star size={12} className="text-yellow-400 fill-yellow-400" />,
  dropped: <X size={12} className="text-red-400" />,
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface Props {
  event: ActivityEvent
  highlight?: boolean
}

export default function ActivityFeedItem({ event, highlight }: Props) {
  const poster = tmdbPoster(event.moviePosterPath, 'w92')

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        highlight ? 'bg-brand-900/20 border border-brand-800/40' : 'hover:bg-gray-800/50'
      }`}
      role="listitem"
    >
      {/* User avatar */}
      <div className="flex-shrink-0">
        {event.userAvatarUrl ? (
          <img
            src={event.userAvatarUrl}
            alt={event.userDisplayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-300">
            {event.userDisplayName[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug">
          <span className="font-semibold text-white">{event.userDisplayName}</span>
          {' '}
          <span className="inline-flex items-center gap-1">
            {ACTION_ICONS[event.action] ?? <Film size={12} />}
          </span>
          {' '}
          {event.details ?? event.action}
          {event.movieTmdbId && (
            <>
              {' '}
              <Link
                to={`/movie/${event.mediaType ?? 'movie'}/${event.movieTmdbId}`}
                className="text-brand-400 hover:underline"
              >
                {event.movieTitle}
              </Link>
            </>
          )}
        </p>
        <time className="text-xs text-gray-500 mt-0.5 block" dateTime={event.occurredAt}>
          {timeAgo(event.occurredAt)}
        </time>
      </div>

      {/* Poster thumbnail */}
      {poster && (
        <div className="flex-shrink-0">
          <img
            src={poster}
            alt={event.movieTitle ?? ''}
            className="w-8 h-12 object-cover rounded"
          />
        </div>
      )}
    </div>
  )
}
