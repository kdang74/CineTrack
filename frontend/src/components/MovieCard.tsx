import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Tv, Film } from 'lucide-react'
import type { Movie, TmdbSearchResult, WatchlistItem } from '../types'
import { tmdbPoster } from '../lib/api'
import WatchlistButton from './WatchlistButton'

type MovieLike = Movie | TmdbSearchResult

function isMovie(m: MovieLike): m is Movie {
  return 'tmdbRating' in m
}

interface Props {
  movie: MovieLike
  watchlistItem?: WatchlistItem
  onWatchlistChange?: () => void
  compact?: boolean
}

export default function MovieCard({ movie, watchlistItem, onWatchlistChange, compact }: Props) {
  const [imgError, setImgError] = useState(false)
  // Movie (from DB) has both .id (DB key) and .tmdbId; TmdbSearchResult uses .id as the TMDB ID
  const tmdbId = isMovie(movie) ? movie.tmdbId : movie.id
  const mediaType = isMovie(movie) ? movie.mediaType : (movie.mediaType || 'movie')
  const posterPath = isMovie(movie) ? movie.posterPath : movie.posterPath
  const rating = isMovie(movie) ? movie.tmdbRating : movie.voteAverage
  const posterSrc = !imgError ? tmdbPoster(posterPath) : null

  return (
    <article
      className={`card group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${compact ? 'h-auto' : ''}`}
      aria-label={`${movie.title} (${mediaType === 'tv' ? 'TV Show' : 'Movie'})`}
    >
      {/* Poster */}
      <Link to={`/movie/${mediaType}/${tmdbId}`} className="block aspect-[2/3] bg-gray-800 relative overflow-hidden">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600">
            {mediaType === 'tv' ? <Tv size={32} /> : <Film size={32} />}
            <span className="text-xs text-center px-2">{movie.title}</span>
          </div>
        )}

        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
            <Star size={10} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
            <span className="text-xs font-medium text-white">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Media type badge */}
        <div className="absolute top-2 right-2">
          <span className={`badge text-xs ${mediaType === 'tv' ? 'bg-purple-900/80 text-purple-300' : 'bg-blue-900/80 text-blue-300'}`}>
            {mediaType === 'tv' ? 'TV' : 'Film'}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link to={`/movie/${mediaType}/${tmdbId}`} className="hover:text-brand-400 transition-colors">
          <h3 className="font-semibold text-sm text-white line-clamp-2 leading-tight">{movie.title}</h3>
        </Link>

        {movie.releaseDate && (
          <p className="text-xs text-gray-500">{new Date(movie.releaseDate).getFullYear()}</p>
        )}

        {!compact && (
          <WatchlistButton
            tmdbId={tmdbId}
            mediaType={mediaType}
            movie={movie}
            existingItem={watchlistItem}
            onSuccess={onWatchlistChange}
          />
        )}
      </div>
    </article>
  )
}
