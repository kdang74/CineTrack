import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Movie, SearchResponse, TmdbSearchResult } from '../types'
import SearchBar from '../components/SearchBar'
import MovieGrid from '../components/MovieGrid'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function BrowsePage() {
  usePageTitle('Browse')
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const mediaType = searchParams.get('type') || ''
  // page drives BOTH search and browse so the URL always reflects current position
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [browsed, setBrowsed] = useState<Movie[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [browseTotal, setBrowseTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string, p: number, type: string) => {
    setLoading(true)
    try {
      const { data }: { data: SearchResponse } = await api.get('/api/movies/search', {
        params: { q, page: p, type: type || 'multi' },
      })
      setResults(data.results ?? [])
      setTotalPages(data.totalPages ?? 1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadBrowse = useCallback(async (p: number, type: string) => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/movies', {
        params: { page: p, pageSize: 24, mediaType: type || undefined },
      })
      setBrowsed(data.results ?? [])
      setBrowseTotal(data.total ?? 0)
    } catch {
      setBrowsed([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Single effect — page from URL drives both modes
  useEffect(() => {
    if (query) search(query, page, mediaType)
    else loadBrowse(page, mediaType)
  }, [query, page, mediaType, search, loadBrowse])

  // Always update URL so back-button restores position
  const handleSearch = (q: string) => {
    if (q) {
      setSearchParams({ q, type: mediaType, page: '1' })
    } else {
      // Cleared search — go back to browse at page 1, keep media type filter
      const params: Record<string, string> = { page: '1' }
      if (mediaType) params.type = mediaType
      setSearchParams(params)
    }
  }

  const changePage = (delta: number) => {
    const maxPage = query ? totalPages : Math.ceil(browseTotal / 24)
    const next = Math.max(1, Math.min(maxPage, page + delta))
    const params: Record<string, string> = { page: String(next) }
    if (query) params.q = query
    if (mediaType) params.type = mediaType
    setSearchParams(params)
  }

  const maxPage = query ? totalPages : Math.ceil(browseTotal / 24)
  const movies = query ? results : browsed

  return (
    <main className="max-w-7xl mx-auto px-4 py-8" aria-labelledby="browse-heading">
      <h1 id="browse-heading" className="text-3xl font-bold text-white mb-6">
        {query ? `Results for "${query}"` : 'Browse Titles'}
      </h1>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} loading={loading} initialValue={query} />
        </div>
        <div className="flex gap-2">
          {(['', 'movie', 'tv'] as const).map((type) => (
            <button
              key={type || 'all'}
              onClick={() => {
                const params: Record<string, string> = { page: '1' }
                if (type) params.type = type
                if (query) params.q = query
                setSearchParams(params)
              }}
              className={`btn-secondary text-sm py-1.5 px-3 ${mediaType === type ? 'bg-gray-700 text-white' : ''}`}
              aria-pressed={mediaType === type}
            >
              {type === '' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      </div>

      <MovieGrid
        movies={movies}
        loading={loading}
        emptyTitle={query ? 'No results found' : 'No titles in database yet'}
        emptyDescription={
          query ? 'Try a different search term or filter.' : 'Seed data will populate this catalog.'
        }
      />

      {/* Pagination */}
      {maxPage > 1 && (
        <nav className="flex items-center justify-center gap-4 mt-8" aria-label="Pagination">
          <button
            onClick={() => changePage(-1)}
            disabled={page <= 1 || loading}
            className="btn-secondary py-1.5 px-3"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-400" aria-current="page">
            Page {page} of {maxPage}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={page >= maxPage || loading}
            className="btn-secondary py-1.5 px-3"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </main>
  )
}
