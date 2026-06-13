import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center" aria-labelledby="not-found-heading">
      <Film size={48} className="text-gray-700 mb-4" aria-hidden="true" />
      <h1 id="not-found-heading" className="text-6xl font-extrabold text-gray-700 mb-2">404</h1>
      <p className="text-xl text-gray-400 mb-6">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </main>
  )
}
