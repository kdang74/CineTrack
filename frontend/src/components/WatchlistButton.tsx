import { useState } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Movie, TmdbSearchResult, WatchlistItem } from '../types'

type MovieLike = Movie | TmdbSearchResult

interface Props {
  tmdbId: number
  mediaType: string
  movie: MovieLike
  existingItem?: WatchlistItem
  onSuccess?: () => void
  className?: string
}

function isMovie(m: MovieLike): m is Movie {
  return 'tmdbRating' in m
}

export default function WatchlistButton({ tmdbId, mediaType, movie, existingItem, onSuccess, className }: Props) {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(!!existingItem)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!user) { login(); return }
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/me/watchlist', {
        tmdbId,
        mediaType,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate,
        tmdbRating: isMovie(movie) ? movie.tmdbRating : movie.voteAverage,
        tmdbVoteCount: isMovie(movie) ? movie.tmdbVoteCount : (movie.voteCount ?? 0),
        genreIds: isMovie(movie) ? undefined : movie.genreIds,
      })
      setAdded(true)
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  if (added || existingItem) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-green-400 font-medium ${className}`}>
        <Check size={12} aria-hidden="true" /> In watchlist
      </span>
    )
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`btn-primary text-xs py-1.5 px-3 w-full justify-center ${className}`}
        aria-label={`Add ${movie.title} to watchlist`}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
        Add to Watchlist
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
