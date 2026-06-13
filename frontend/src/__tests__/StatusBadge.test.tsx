import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '../components/StatusBadge'

describe('StatusBadge', () => {
  it('renders Watchlist status', () => {
    render(<StatusBadge status="Watchlist" />)
    expect(screen.getByLabelText('Status: Want to Watch')).toBeInTheDocument()
  })
  it('renders Watched status', () => {
    render(<StatusBadge status="Watched" />)
    expect(screen.getByLabelText('Status: Watched')).toBeInTheDocument()
  })
  it('renders Watching status', () => {
    render(<StatusBadge status="Watching" />)
    expect(screen.getByLabelText('Status: Watching')).toBeInTheDocument()
  })
  it('renders Dropped status', () => {
    render(<StatusBadge status="Dropped" />)
    expect(screen.getByLabelText('Status: Dropped')).toBeInTheDocument()
  })
})
