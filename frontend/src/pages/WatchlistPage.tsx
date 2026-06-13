import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, tmdbPoster } from '../lib/api'
import type { WatchlistItem } from '../types'
import { Pencil, Trash2, Film, List } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import RatingStars from '../components/RatingStars'
import WatchlistForm from '../components/WatchlistForm'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'

export default function WatchlistPage() {
  usePageTitle('My Watchlist')
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const { data } = await api.get('/api/me/watchlist', { params })
      setItems(data.filter((i: WatchlistItem) => i.status !== 'Watched'))
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove from watchlist?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/me/watchlist/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {}
    finally { setDeleting(null) }
  }

  const handleUpdate = (updated: WatchlistItem) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i).filter(i => i.status !== 'Watched'))
    setEditing(null)
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" aria-labelledby="watchlist-heading">
      <div className="flex items-center justify-between mb-6">
        <h1 id="watchlist-heading" className="text-2xl font-bold text-white">My Watchlist</h1>
        <Link to="/browse" className="btn-primary text-sm py-1.5 px-3">Add titles</Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap" role="group" aria-label="Filter by status">
        {['', 'Watchlist', 'Watching', 'Dropped'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`btn-secondary text-sm py-1 px-3 ${statusFilter === s ? 'bg-gray-700 text-white' : ''}`}
            aria-pressed={statusFilter === s}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? (
        <EmptyState
          icon={<List size={28} />}
          title="Nothing here yet"
          description="Add movies and TV shows to your watchlist to track them here."
          action={<Link to="/browse" className="btn-primary">Browse Titles</Link>}
        />
      ) : (
        <div className="space-y-3" role="list" aria-label="Watchlist items">
          {items.map((item) => {
            const poster = tmdbPoster(item.movie.posterPath, 'w92')
            return (
              <article key={item.id} className="card p-4 flex gap-4" role="listitem">
                {/* Poster */}
                <Link to={`/movie/${item.movie.mediaType}/${item.movie.tmdbId}`} className="flex-shrink-0" aria-label={`View ${item.movie.title}`}>
                  <div className="w-14 h-20 rounded overflow-hidden bg-gray-800">
                    {poster ? (
                      <img src={poster} alt={`${item.movie.title} poster`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><Film size={16} /></div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/movie/${item.movie.mediaType}/${item.movie.tmdbId}`} className="font-semibold text-white hover:text-brand-400 transition-colors">
                        {item.movie.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.movie.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                        {item.movie.releaseDate && ` • ${new Date(item.movie.releaseDate).getFullYear()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {item.userRating && (
                    <div className="mt-2">
                      <RatingStars value={item.userRating} readonly size={12} />
                    </div>
                  )}
                  {item.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.notes}</p>}

                  {/* Edit form */}
                  {editing === item.id && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <WatchlistForm item={item} onSuccess={handleUpdate} onCancel={() => setEditing(null)} />
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setEditing(editing === item.id ? null : item.id)}
                      className="btn-secondary text-xs py-1 px-2.5"
                      aria-label={`Edit ${item.movie.title}`}
                      aria-expanded={editing === item.id}
                    >
                      <Pencil size={12} /> {editing === item.id ? 'Close' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="btn-danger text-xs py-1 px-2.5"
                      aria-label={`Remove ${item.movie.title} from watchlist`}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
