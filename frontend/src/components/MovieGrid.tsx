import type { Movie, TmdbSearchResult, WatchlistItem } from '../types'
import MovieCard from './MovieCard'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'
import { Film } from 'lucide-react'

type MovieLike = Movie | TmdbSearchResult

interface Props {
  movies: MovieLike[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  watchlistMap?: Record<number, WatchlistItem>
  onWatchlistChange?: () => void
}

export default function MovieGrid({ movies, loading, emptyTitle, emptyDescription, emptyAction, watchlistMap, onWatchlistChange }: Props) {
  if (loading) return <LoadingSpinner text="Loading titles…" />

  if (movies.length === 0) {
    return (
      <EmptyState
        icon={<Film size={28} />}
        title={emptyTitle ?? 'No titles found'}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      aria-label="Movie grid"
    >
      {movies.map((movie) => (
        <MovieCard
          key={`${movie.id}-${'mediaType' in movie ? movie.mediaType : 'movie'}`}
          movie={movie}
          watchlistItem={watchlistMap?.[movie.id]}
          onWatchlistChange={onWatchlistChange}
        />
      ))}
    </div>
  )
}
