import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

import LandingPage from './pages/LandingPage'
import BrowsePage from './pages/BrowsePage'
import MovieDetailPage from './pages/MovieDetailPage'
import DashboardPage from './pages/DashboardPage'
import WatchlistPage from './pages/WatchlistPage'
import WatchedPage from './pages/WatchedPage'
import ActivityFeedPage from './pages/ActivityFeedPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <div className="flex-1">
            <ErrorBoundary>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/movie/:mediaType/:tmdbId" element={<MovieDetailPage />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/watchlist" element={
                  <ProtectedRoute><WatchlistPage /></ProtectedRoute>
                } />
                <Route path="/watched" element={
                  <ProtectedRoute><WatchedPage /></ProtectedRoute>
                } />
                <Route path="/activity" element={
                  <ProtectedRoute><ActivityFeedPage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </div>

          <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-600">
            <p>
              CineTrack — Movie data provided by{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-400 underline"
              >
                TMDB
              </a>
            </p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
