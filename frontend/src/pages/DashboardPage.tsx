import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, tmdbPoster } from '../lib/api'
import type { WatchlistItem } from '../types'
import { List, Eye, Clock, X, Star, ArrowRight, Film } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { usePageTitle } from '../hooks/usePageTitle'

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Watchlist: <List size={14} />,
  Watching:  <Clock size={14} />,
  Watched:   <Eye size={14} />,
  Dropped:   <X size={14} />,
}

const STATUS_COLORS: Record<string, string> = {
  Watchlist: 'text-blue-400',
  Watching:  'text-yellow-400',
  Watched:   'text-green-400',
  Dropped:   'text-red-400',
}

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/me/watchlist')
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    Watchlist: items.filter(i => i.status === 'Watchlist').length,
    Watching: items.filter(i => i.status === 'Watching').length,
    Watched: items.filter(i => i.status === 'Watched').length,
    Dropped: items.filter(i => i.status === 'Dropped').length,
  }

  const avgRating = items.filter(i => i.userRating).length > 0
    ? (items.reduce((s, i) => s + (i.userRating ?? 0), 0) / items.filter(i => i.userRating).length).toFixed(1)
    : null

  const recentlyWatched = items.filter(i => i.status === 'Watched').slice(0, 6)

  if (loading) return <LoadingSpinner />

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" aria-labelledby="dashboard-heading">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.displayName} className="w-16 h-16 rounded-full ring-2 ring-gray-700" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold">
            {user?.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 id="dashboard-heading" className="text-2xl font-bold text-white">Welcome back, {user?.displayName}!</h1>
          <p className="text-gray-500 text-sm">
            Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8" aria-label="Your stats">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="card p-4">
            <div className={`flex items-center gap-2 mb-2 ${STATUS_COLORS[status]}`} aria-hidden="true">
              {STATUS_ICONS[status]}
              <span className="text-xs font-medium uppercase tracking-wide">{status}</span>
            </div>
            <p className="text-3xl font-bold text-white">{count}</p>
          </div>
        ))}
      </section>

      {/* Avg rating */}
      {avgRating && (
        <div className="card p-4 mb-8 flex items-center gap-4">
          <Star size={24} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Your average rating</p>
            <p className="text-2xl font-bold text-white">{avgRating} <span className="text-sm text-gray-500">/ 10</span></p>
          </div>
        </div>
      )}

      {/* Recently watched */}
      {recentlyWatched.length > 0 && (
        <section aria-labelledby="recently-watched-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="recently-watched-heading" className="text-lg font-semibold text-white">Recently Watched</h2>
            <Link to="/watched" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {recentlyWatched.map((item) => {
              const poster = tmdbPoster(item.movie.posterPath)
              return (
                <Link
                  key={item.id}
                  to={`/movie/${item.movie.mediaType}/${item.movie.tmdbId}`}
                  className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 hover:ring-2 hover:ring-brand-500 transition-all"
                  aria-label={item.movie.title}
                >
                  {poster ? (
                    <img src={poster} alt={`${item.movie.title} poster`} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Film size={24} />
                    </div>
                  )}
                  {item.userRating && (
                    <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1 flex items-center gap-0.5">
                      <Star size={8} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-white">{item.userRating}</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <Film size={40} className="mx-auto text-gray-700 mb-4" aria-hidden="true" />
          <p className="text-gray-400 mb-4">Your watchlist is empty</p>
          <Link to="/browse" className="btn-primary">Browse Titles</Link>
        </div>
      )}
    </main>
  )
}
