import { useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

interface Props {
  onSearch: (query: string) => void
  loading?: boolean
  placeholder?: string
  initialValue?: string
}

export default function SearchBar({ onSearch, loading, placeholder = 'Search movies & TV shows…', initialValue = '' }: Props) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full">
      <div className="relative flex items-center">
        <Search
          className="absolute left-3 text-gray-500 pointer-events-none"
          size={18}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="input pl-10 pr-20"
          aria-label="Search for movies and TV shows"
          autoComplete="off"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors rounded"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          {loading && <Loader2 size={16} className="animate-spin text-gray-500" aria-label="Searching…" />}
          <button
            type="submit"
            className="btn-primary text-xs py-1 px-2.5"
            disabled={loading}
            aria-label="Search"
          >
            Go
          </button>
        </div>
      </div>
    </form>
  )
}
