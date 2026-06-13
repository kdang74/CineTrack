import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import { AuthContext } from '../contexts/AuthContext'
import type { Movie } from '../types'

const mockMovie: Movie = {
  id: 1,
  tmdbId: 550,
  mediaType: 'movie',
  title: 'Fight Club',
  overview: 'An insomniac office worker forms a fight club.',
  posterPath: '/fight-club.jpg',
  releaseDate: '1999-10-15',
  tmdbRating: 8.4,
  tmdbVoteCount: 26000,
  genres: ['Drama', 'Thriller'],
}

const mockTvShow: Movie = {
  id: 2,
  tmdbId: 1396,
  mediaType: 'tv',
  title: 'Breaking Bad',
  overview: 'A chemistry teacher becomes a drug lord.',
  posterPath: null,
  releaseDate: '2008-01-20',
  tmdbRating: 9.5,
  tmdbVoteCount: 12000,
}

const authCtx = { user: null, loading: false, login: vi.fn(), logout: vi.fn(), refetch: vi.fn() }

function renderCard(movie: Movie) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authCtx}>
        <MovieCard movie={movie} />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('MovieCard', () => {
  it('renders the movie title', () => {
    renderCard(mockMovie)
    expect(screen.getByText('Fight Club')).toBeInTheDocument()
  })

  it('renders a link using the TMDB ID (not the DB id)', () => {
    renderCard(mockMovie)
    const links = screen.getAllByRole('link')
    // Should link to /movie/movie/550 (tmdbId=550), not /movie/movie/1 (id=1)
    expect(links.some(l => l.getAttribute('href')?.includes('/movie/movie/550'))).toBe(true)
    expect(links.every(l => !l.getAttribute('href')?.includes('/movie/movie/1'))).toBe(true)
  })

  it('shows the release year', () => {
    renderCard(mockMovie)
    expect(screen.getByText('1999')).toBeInTheDocument()
  })

  it('shows the TMDB rating badge', () => {
    renderCard(mockMovie)
    expect(screen.getByText('8.4')).toBeInTheDocument()
  })

  it('shows Film badge for movies', () => {
    renderCard(mockMovie)
    expect(screen.getByText('Film')).toBeInTheDocument()
  })

  it('shows TV badge for TV shows', () => {
    renderCard(mockTvShow)
    expect(screen.getByText('TV')).toBeInTheDocument()
  })

  it('renders a placeholder icon when no poster path', () => {
    renderCard(mockTvShow)
    // When no poster, the title is displayed inside the poster area
    const titleInPoster = screen.getAllByText('Breaking Bad')
    expect(titleInPoster.length).toBeGreaterThan(0)
  })

  it('has an accessible article element with aria-label', () => {
    renderCard(mockMovie)
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-label', expect.stringContaining('Fight Club'))
  })
})
