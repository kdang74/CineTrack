import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RatingStars from '../components/RatingStars'

describe('RatingStars', () => {
  it('renders 10 star buttons', () => {
    render(<RatingStars value={null} onChange={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(10)
  })

  it('calls onChange with correct value when star is clicked', async () => {
    const onChange = vi.fn()
    render(<RatingStars value={null} onChange={onChange} />)
    const button = screen.getByLabelText('7 stars')
    await userEvent.click(button)
    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('shows rating text when value is set', () => {
    render(<RatingStars value={8} readonly />)
    expect(screen.getByText('8/10')).toBeInTheDocument()
  })

  it('does not call onChange when readonly', async () => {
    const onChange = vi.fn()
    render(<RatingStars value={5} onChange={onChange} readonly />)
    const button = screen.getByLabelText('3 stars')
    await userEvent.click(button)
    expect(onChange).not.toHaveBeenCalled()
  })
})
