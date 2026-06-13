export interface User {
  id: number
  displayName: string
  avatarUrl?: string
  email?: string
  joinedAt: string
  stats?: { status: string; count: number }[]
}

export interface Movie {
  id: number
  tmdbId: number
  mediaType: 'movie' | 'tv'
  title: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  releaseDate?: string
  tmdbRating: number
  tmdbVoteCount: number
  genres?: string[]
}

export interface WatchlistItem {
  id: number
  movie: Movie
  status: 'Watchlist' | 'Watching' | 'Watched' | 'Dropped'
  userRating?: number
  notes?: string
  addedAt: string
  watchedAt?: string
}

export interface ActivityEvent {
  id: number
  userDisplayName: string
  userAvatarUrl?: string
  action: string
  details?: string
  movieTitle?: string
  moviePosterPath?: string
  movieTmdbId?: number
  mediaType?: string
  occurredAt: string
}

export interface TmdbSearchResult {
  id: number
  mediaType: string
  title: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  releaseDate?: string
  voteAverage: number
  voteCount: number
  genreIds?: number[]
}

export interface SearchResponse {
  page: number
  results: TmdbSearchResult[]
  totalPages: number
  totalResults: number
}

export interface Stats {
  totalMovies: number
  totalUsers: number
  totalWatched: number
  trendingMovies: Movie[]
}

export type WatchStatus = 'Watchlist' | 'Watching' | 'Watched' | 'Dropped'
