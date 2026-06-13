import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from '../components/EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })
  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Add something to get started." />)
    expect(screen.getByText('Add something to get started.')).toBeInTheDocument()
  })
  it('renders action when provided', () => {
    render(<EmptyState title="Empty" action={<button>Add Item</button>} />)
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })
})
