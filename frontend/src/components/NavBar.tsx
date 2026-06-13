import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Film, Search, List, Eye, Activity, User, LogOut, LogIn } from 'lucide-react'

export default function NavBar() {
  const { user, login, logout, loading } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <Film className="text-brand-500" size={24} aria-hidden="true" />
            <span>CineTrack</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavItem to="/browse" icon={<Search size={16} />} label="Browse" />
            {user && (
              <>
                <NavItem to="/watchlist" icon={<List size={16} />} label="Watchlist" />
                <NavItem to="/watched" icon={<Eye size={16} />} label="Watched" />
                <NavItem to="/activity" icon={<Activity size={16} />} label="Activity" />
                <NavItem to="/dashboard" icon={<User size={16} />} label="Dashboard" />
              </>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" aria-label="Loading" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-semibold">
                      {user.displayName[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-200">{user.displayName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary py-1.5 px-3 text-sm"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <button onClick={login} className="btn-primary py-1.5 px-3 text-sm">
                <LogIn size={14} />
                Sign in with Google
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {user && (
          <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
            <MobileNavItem to="/browse" label="Browse" />
            <MobileNavItem to="/watchlist" label="Watchlist" />
            <MobileNavItem to="/watched" label="Watched" />
            <MobileNavItem to="/activity" label="Live" />
            <MobileNavItem to="/dashboard" label="Dashboard" />
          </div>
        )}
      </nav>
    </header>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

function MobileNavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
          isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}
