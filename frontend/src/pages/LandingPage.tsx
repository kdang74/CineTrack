import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, tmdbPoster } from '../lib/api'
import type { Stats } from '../types'
import { Film, Star, Users, Eye, ArrowRight, Zap } from 'lucide-react'

export default function LandingPage() {
  const { user, login } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        {/* Backdrop montage */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-6 gap-1 h-full overflow-hidden">
            {stats?.trendingMovies?.slice(0, 6).map((m) => (
              <div key={m.id} className="overflow-hidden">
                {m.backdropPath && (
                  <img
                    src={tmdbPoster(m.backdropPath, 'w500') ?? ''}
                    alt=""
                    className="w-full h-full object-cover"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-900/50 border border-brand-800 rounded-full px-4 py-1.5 text-sm text-brand-300 mb-6">
            <Zap size={14} className="fill-brand-400" />
            Live activity feed — see what the community is watching
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Your movies,<br />
            <span className="text-brand-400">your list.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            CineTrack helps you discover, track, and rate every movie and TV show you watch.
            Never lose track of what to watch next.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-base px-6 py-3">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <button onClick={login} className="btn-primary text-base px-6 py-3">
                Get Started Free <ArrowRight size={18} />
              </button>
            )}
            <Link to="/browse" className="btn-secondary text-base px-6 py-3">
              Browse Titles <Film size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {!loading && stats && (
        <section className="bg-gray-900 border-b border-gray-800" aria-label="Platform statistics">
          <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-6 text-center">
            <StatItem value={stats.totalMovies.toLocaleString()} label="Titles in catalog" icon={<Film size={20} />} />
            <StatItem value={stats.totalUsers.toLocaleString()} label="Community members" icon={<Users size={20} />} />
            <StatItem value={stats.totalWatched.toLocaleString()} label="Titles watched" icon={<Eye size={20} />} />
          </div>
        </section>
      )}

      {/* Trending */}
      {stats && stats.trendingMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16" aria-labelledby="trending-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="trending-heading" className="text-2xl font-bold text-white">Trending Now</h2>
            <Link to="/browse" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {stats.trendingMovies.slice(0, 10).map((movie) => {
              const poster = tmdbPoster(movie.posterPath)
              return (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.mediaType}/${movie.tmdbId}`}
                  className="group relative block rounded-xl overflow-hidden aspect-[2/3] bg-gray-800 hover:ring-2 hover:ring-brand-500 transition-all"
                  aria-label={`${movie.title} (${movie.mediaType === 'tv' ? 'TV' : 'Movie'})`}
                >
                  {poster && (
                    <img
                      src={poster}
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs font-semibold text-white line-clamp-2">{movie.title}</p>
                    {movie.tmdbRating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-400 mt-0.5">
                        <Star size={10} className="fill-yellow-400" />
                        {movie.tmdbRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="bg-gray-900 border-t border-gray-800" aria-labelledby="features-heading">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 id="features-heading" className="text-3xl font-bold text-center text-white mb-12">
            Everything you need to track your viewing
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Film, title: 'Search any title', desc: 'Find any movie or TV show from TMDB\'s massive database of thousands of titles.' },
              { icon: Star, title: 'Rate & review', desc: 'Give ratings from 1–10 and add personal notes to remember your thoughts.' },
              { icon: Eye, title: 'Live activity feed', desc: 'See what the community is watching in real time with our live activity feed.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-900/50 border border-brand-800 mb-4">
                  <Icon size={22} className="text-brand-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function StatItem({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-brand-400 mb-1" aria-hidden="true">{icon}</div>
      <span className="text-2xl sm:text-3xl font-bold text-white">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}
