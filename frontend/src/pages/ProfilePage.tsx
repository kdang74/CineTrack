import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { WatchlistItem } from '../types'
import { Star, Film, Tv, Eye, Calendar } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { usePageTitle } from '../hooks/usePageTitle'

export default function ProfilePage() {
  usePageTitle('Profile')
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/me/watchlist')
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }, [])

  const watched = items.filter(i => i.status === 'Watched')
  const rated = items.filter(i => i.userRating !== null && i.userRating !== undefined)
  const avgRating = rated.length > 0
    ? (rated.reduce((s, i) => s + (i.userRating ?? 0), 0) / rated.length).toFixed(1)
    : null
  const movies = items.filter(i => i.movie.mediaType === 'movie')
  const shows = items.filter(i => i.movie.mediaType === 'tv')
  const topRated = [...rated].sort((a, b) => (b.userRating ?? 0) - (a.userRating ?? 0)).slice(0, 3)

  if (loading) return <LoadingSpinner />

  return (
    <main className="max-w-3xl mx-auto px-4 py-8" aria-labelledby="profile-heading">
      {/* Header */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.displayName} className="w-20 h-20 rounded-full ring-2 ring-gray-700" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-bold">
            {user?.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 id="profile-heading" className="text-2xl font-bold text-white">{user?.displayName}</h1>
          {user?.email && <p className="text-gray-500 text-sm">{user.email}</p>}
          <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
            <Calendar size={12} />
            <span>Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" aria-label="Profile statistics">
        {[
          { icon: <Eye size={18} className="text-green-400" />, value: watched.length, label: 'Watched' },
          { icon: <Star size={18} className="text-yellow-400" />, value: avgRating ?? '—', label: 'Avg Rating' },
          { icon: <Film size={18} className="text-blue-400" />, value: movies.length, label: 'Movies' },
          { icon: <Tv size={18} className="text-purple-400" />, value: shows.length, label: 'TV Shows' },
        ].map(({ icon, value, label }) => (
          <div key={label} className="card p-4 text-center">
            <div className="flex justify-center mb-1" aria-hidden="true">{icon}</div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </section>

      {/* Top rated */}
      {topRated.length > 0 && (
        <section className="card p-5" aria-labelledby="top-rated-heading">
          <h2 id="top-rated-heading" className="font-semibold text-white mb-4 flex items-center gap-2">
            <Star size={16} className="text-yellow-400 fill-yellow-400" /> Your Top Rated
          </h2>
          <div className="space-y-3">
            {topRated.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-600 w-5 text-right">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.movie.title}</p>
                  <p className="text-xs text-gray-500">{item.movie.mediaType === 'tv' ? 'TV Show' : 'Movie'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white">{item.userRating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
