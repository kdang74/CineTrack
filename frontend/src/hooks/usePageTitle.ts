import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — CineTrack` : 'CineTrack — Movie & TV Watchlist'
    return () => {
      document.title = 'CineTrack — Movie & TV Watchlist'
    }
  }, [title])
}
