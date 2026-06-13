import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { AuthContext } from '../contexts/AuthContext'
import type { User } from '../types'

const mockUser: User = { id: 1, displayName: 'Alice B.', joinedAt: new Date().toISOString() }

function renderNav(user: User | null, loading = false) {
  const logout = vi.fn()
  const login = vi.fn()
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user, loading, login, logout, refetch: vi.fn() }}>
        <NavBar />
      </AuthContext.Provider>
    </MemoryRouter>
  )
  return { logout, login }
}

describe('NavBar', () => {
  it('renders the CineTrack brand link', () => {
    renderNav(null)
    expect(screen.getByRole('link', { name: /cinetrack/i })).toBeInTheDocument()
  })

  it('shows Sign In button when not authenticated', () => {
    renderNav(null)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows user display name when authenticated', () => {
    renderNav(mockUser)
    expect(screen.getByText(/alice/i)).toBeInTheDocument()
  })

  it('shows Sign Out button when authenticated', () => {
    renderNav(mockUser)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls logout when Sign Out is clicked', () => {
    const { logout } = renderNav(mockUser)
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(logout).toHaveBeenCalled()
  })

  it('calls login when Sign In is clicked', () => {
    const { login } = renderNav(null)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(login).toHaveBeenCalled()
  })

  it('has a Browse link', () => {
    renderNav(null)
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument()
  })

  it('shows Dashboard link when authenticated', () => {
    renderNav(mockUser)
    // Desktop and mobile nav both render a Dashboard link
    const dashLinks = screen.getAllByRole('link', { name: /dashboard/i })
    expect(dashLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('does not show Dashboard link when not authenticated', () => {
    renderNav(null)
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
  })
})
