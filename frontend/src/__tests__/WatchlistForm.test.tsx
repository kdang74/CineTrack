import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WatchlistForm from '../components/WatchlistForm'
import type { WatchlistItem } from '../types'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { put: vi.fn() },
}))

const mockItem: WatchlistItem = {
  id: 1,
  status: 'Watchlist',
  userRating: undefined,
  notes: '',
  addedAt: new Date().toISOString(),
  movie: {
    id: 1, tmdbId: 550, mediaType: 'movie', title: 'Fight Club',
    tmdbRating: 8.4, tmdbVoteCount: 1000,
  },
}

describe('WatchlistForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the form with all status options', () => {
    render(<WatchlistForm item={mockItem} onSuccess={vi.fn()} />)
    expect(screen.getByLabelText('Watchlist')).toBeInTheDocument()
    expect(screen.getByLabelText('Watching')).toBeInTheDocument()
    expect(screen.getByLabelText('Watched')).toBeInTheDocument()
    expect(screen.getByLabelText('Dropped')).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(<WatchlistForm item={mockItem} onSuccess={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders cancel button when onCancel is provided', () => {
    render(<WatchlistForm item={mockItem} onSuccess={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<WatchlistForm item={mockItem} onSuccess={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows validation error for notes over 1000 chars', async () => {
    render(<WatchlistForm item={mockItem} onSuccess={vi.fn()} />)
    const notesEl = screen.getByRole('textbox', { name: /notes/i })
    // Use fireEvent for large text to avoid userEvent slowness
    fireEvent.change(notesEl, { target: { value: 'a'.repeat(1001) } })
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('calls api.put and onSuccess on successful submit', async () => {
    const onSuccess = vi.fn()
    const updatedItem = { ...mockItem, status: 'Watched' }
    vi.mocked(api.put).mockResolvedValueOnce({ data: updatedItem })

    render(<WatchlistForm item={mockItem} onSuccess={onSuccess} />)

    const watchedRadio = screen.getByLabelText('Watched')
    await userEvent.click(watchedRadio)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(updatedItem))
  })
})
