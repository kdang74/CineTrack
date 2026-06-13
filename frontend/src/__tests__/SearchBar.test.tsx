import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '../components/SearchBar'

describe('SearchBar', () => {
  it('renders the input with correct placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search movies & TV shows…')).toBeInTheDocument()
  })

  it('calls onSearch when form is submitted', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'Inception')
    fireEvent.submit(input.closest('form')!)
    expect(onSearch).toHaveBeenCalledWith('Inception')
  })

  it('calls onSearch with empty string when submitted empty (allows clearing results)', () => {
    // Intentional behavior: submitting an empty query calls onSearch('') so the
    // browse page can reset back to the catalog view
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    fireEvent.submit(screen.getByRole('search'))
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('shows clear button when input has value', async () => {
    render(<SearchBar onSearch={vi.fn()} />)
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'test')
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('clears input and calls onSearch with empty string when clear is clicked', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'test')
    await userEvent.click(screen.getByLabelText('Clear search'))
    expect(input).toHaveValue('')
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('shows loading state', () => {
    render(<SearchBar onSearch={vi.fn()} loading={true} />)
    expect(screen.getByLabelText('Searching…')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Custom placeholder" />)
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })
})
