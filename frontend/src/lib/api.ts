import axios from 'axios'

// Production uses same-origin (proxied via vercel.json) so auth cookies work in all browsers.
// CI/local dev set VITE_API_URL explicitly; unset/empty in prod → relative URLs.
export const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000')
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect — let React handle it
    }
    return Promise.reject(err)
  }
)

export function tmdbPoster(path: string | null | undefined, size = 'w342') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function tmdbBackdrop(path: string | null | undefined, size = 'w1280') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}
