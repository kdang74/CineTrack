import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthContext } from '../contexts/AuthContext'
import type { User } from '../types'

const mockUser: User = { id: 1, displayName: 'Test User', joinedAt: new Date().toISOString() }

const makeContext = (user: User | null, loading = false) => ({
  user,
  loading,
  login: vi.fn(),
  logout: vi.fn(),
  refetch: vi.fn(),
})

function renderProtected(user: User | null, loading = false) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthContext.Provider value={makeContext(user, loading)}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    renderProtected(mockUser)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to home when user is not authenticated', () => {
    renderProtected(null)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('shows loading spinner when auth state is loading', () => {
    renderProtected(null, true)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
