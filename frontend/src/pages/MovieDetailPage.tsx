import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, tmdbPoster, tmdbBackdrop } from '../lib/api'
import type { TmdbSearchResult, WatchlistItem } from '../types'
import { Star, ArrowLeft, Tv, Film, ExternalLink } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import WatchlistButton from '../components/WatchlistButton'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

export default function MovieDetailPage() {
  const { mediaType, tmdbId } = useParams<{ mediaType: string; tmdbId: string }>()
  const { user } = useAuth()
  const [movie, setMovie] = useState<TmdbSearchResult | null>(null)
  const [watchlistItem, setWatchlistItem] = useState<WatchlistItem | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  usePageTitle(movie?.title ?? movie?.name ?? 'Title')

  useEffect(() => {
    if (!tmdbId || !mediaType) return
    setLoading(true)
    api.get(`/api/movies/${mediaType}/${tmdbId}`)
      .then(r => setMovie(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [tmdbId, mediaType])

  useEffect(() => {
    if (!user || !movie) return
    api.get('/api/me/watchlist')
      .then(r => {
        const item = r.data.find((i: WatchlistItem) => i.movie.tmdbId === movie.id)
        setWatchlistItem(item)
      })
      .catch(() => {})
  }, [user, movie])

  if (loading) return <LoadingSpinner />
  if (error || !movie) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <EmptyState
        icon={<Film size={28} />}
        title="Title not found"
        description="This movie or show could not be found."
        action={<Link to="/browse" className="btn-secondary">Back to Browse</Link>}
      />
    </div>
  )

  const backdrop = tmdbBackdrop(movie.backdropPath)
  const poster = tmdbPoster(movie.posterPath, 'w500')
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null

  return (
    <main>
      {/* Backdrop */}
      <div className="relative h-64 sm:h-96 overflow-hidden bg-gray-900">
        {backdrop && (
          <img src={backdrop} alt="" className="w-full h-full object-cover opacity-40" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link to="/browse" className="btn-secondary text-sm py-1.5 px-3">
            <ArrowLeft size={14} /> Browse
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 sm:-mt-32 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-36 sm:w-48 rounded-xl overflow-hidden shadow-2xl ring-2 ring-gray-700 bg-gray-800">
              {poster ? (
                <img src={poster} alt={`${movie.title} poster`} className="w-full h-auto" />
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center text-gray-600">
                  {mediaType === 'tv' ? <Tv size={40} /> : <Film size={40} />}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 pt-4 sm:pt-16">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${mediaType === 'tv' ? 'bg-purple-900/60 text-purple-300 border border-purple-800' : 'bg-blue-900/60 text-blue-300 border border-blue-800'}`}>
                {mediaType === 'tv' ? 'TV Show' : 'Movie'}
              </span>
              {year && <span className="text-gray-500 text-sm">{year}</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{movie.title}</h1>

            {movie.voteAverage > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Star size={18} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                <span className="text-xl font-bold text-white">{movie.voteAverage.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">/ 10</span>
                <span className="text-gray-600 text-sm">({movie.voteCount?.toLocaleString() ?? 0} votes)</span>
              </div>
            )}

            {movie.overview && (
              <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">{movie.overview}</p>
            )}

            <div className="flex gap-3 flex-wrap">
              <WatchlistButton
                tmdbId={movie.id}
                mediaType={mediaType ?? 'movie'}
                movie={movie}
                existingItem={watchlistItem}
                onSuccess={() => {
                  api.get('/api/me/watchlist').then(r => {
                    const item = r.data.find((i: WatchlistItem) => i.movie.tmdbId === movie.id)
                    setWatchlistItem(item)
                  })
                }}
                className="text-sm py-2 px-4"
              />
              <a
                href={`https://www.themoviedb.org/${mediaType}/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
                aria-label={`View ${movie.title} on TMDB (opens in new tab)`}
              >
                <ExternalLink size={14} /> View on TMDB
              </a>
            </div>

            <p className="text-xs text-gray-600 mt-4">
              Movie data provided by{' '}
              <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 underline">
                The Movie Database (TMDB)
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
