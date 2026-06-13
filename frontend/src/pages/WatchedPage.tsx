import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, tmdbPoster } from '../lib/api'
import type { WatchlistItem } from '../types'
import { Pencil, Trash2, Film, Eye, Star } from 'lucide-react'
import RatingStars from '../components/RatingStars'
import WatchlistForm from '../components/WatchlistForm'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function WatchedPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [sort, setSort] = useState<'date' | 'rating'>('date')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/me/watchlist', { params: { status: 'Watched' } })
      setItems(data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const sorted = [...items].sort((a, b) => {
    if (sort === 'rating') return (b.userRating ?? 0) - (a.userRating ?? 0)
    return new Date(b.watchedAt ?? b.addedAt).getTime() - new Date(a.watchedAt ?? a.addedAt).getTime()
  })

  const handleUpdate = (updated: WatchlistItem) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove from watched history?')) return
    await api.delete(`/api/me/watchlist/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" aria-labelledby="watched-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 id="watched-heading" className="text-2xl font-bold text-white">Watched</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} title{items.length !== 1 ? 's' : ''} watched</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSort('date')} className={`btn-secondary text-sm py-1 px-3 ${sort === 'date' ? 'bg-gray-700 text-white' : ''}`} aria-pressed={sort === 'date'}>
            Latest
          </button>
          <button onClick={() => setSort('rating')} className={`btn-secondary text-sm py-1 px-3 ${sort === 'rating' ? 'bg-gray-700 text-white' : ''}`} aria-pressed={sort === 'rating'}>
            Top Rated
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : sorted.length === 0 ? (
        <EmptyState
          icon={<Eye size={28} />}
          title="Nothing watched yet"
          description="Mark items as Watched from your watchlist."
          action={<Link to="/watchlist" className="btn-primary">Go to Watchlist</Link>}
        />
      ) : (
        <div className="grid gap-3" role="list" aria-label="Watched items">
          {sorted.map((item) => {
            const poster = tmdbPoster(item.movie.posterPath, 'w92')
            return (
              <article key={item.id} className="card p-4 flex gap-4" role="listitem">
                <Link to={`/movie/${item.movie.mediaType}/${item.movie.tmdbId}`} className="flex-shrink-0" aria-label={`View ${item.movie.title}`}>
                  <div className="w-14 h-20 rounded overflow-hidden bg-gray-800">
                    {poster ? (
                      <img src={poster} alt={`${item.movie.title} poster`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><Film size={16} /></div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/movie/${item.movie.mediaType}/${item.movie.tmdbId}`} className="font-semibold text-white hover:text-brand-400 transition-colors">
                    {item.movie.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.movie.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                    {item.watchedAt && ` • Watched ${new Date(item.watchedAt).toLocaleDateString()}`}
                  </p>

                  {item.userRating !== undefined && item.userRating !== null ? (
                    <div className="mt-1">
                      <RatingStars value={item.userRating} readonly size={12} />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Star size={10} /> Not rated yet</p>
                  )}

                  {item.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">{item.notes}</p>}

                  {editing === item.id && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <WatchlistForm item={item} onSuccess={handleUpdate} onCancel={() => setEditing(null)} />
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditing(editing === item.id ? null : item.id)} className="btn-secondary text-xs py-1 px-2.5" aria-expanded={editing === item.id}>
                      <Pencil size={12} /> {editing === item.id ? 'Close' : 'Edit'}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn-danger text-xs py-1 px-2.5" aria-label={`Remove ${item.movie.title}`}>
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
