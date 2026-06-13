import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import type { WatchlistItem, WatchStatus } from '../types'
import RatingStars from './RatingStars'
import { api } from '../lib/api'

interface Props {
  item: WatchlistItem
  onSuccess: (updated: WatchlistItem) => void
  onCancel?: () => void
}

const STATUSES: WatchStatus[] = ['Watchlist', 'Watching', 'Watched', 'Dropped']

export default function WatchlistForm({ item, onSuccess, onCancel }: Props) {
  const [status, setStatus] = useState<WatchStatus>(item.status)
  const [rating, setRating] = useState<number | undefined>(item.userRating ?? undefined)
  const [notes, setNotes] = useState(item.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (rating !== undefined && (rating < 1 || rating > 10))
      errs.rating = 'Rating must be between 1 and 10'
    if (notes.length > 1000)
      errs.notes = 'Notes must be 1000 characters or fewer'
    return errs
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const { data } = await api.put(`/api/me/watchlist/${item.id}`, { status, userRating: rating ?? null, notes: notes || null })
      onSuccess(data)
    } catch (err: any) {
      setErrors({ form: err.response?.data?.error ?? 'Failed to update' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Edit watchlist item">
      {/* Status */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-300 mb-2">Status</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Watch status">
          {STATUSES.map((s) => (
            <label key={s} className="cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="sr-only"
              />
              <span
                className={`badge cursor-pointer transition-all border ${
                  status === s
                    ? 'bg-brand-700 text-white border-brand-500'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Rating */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block" htmlFor="rating-stars">
          Rating <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <div id="rating-stars">
          <RatingStars value={rating} onChange={setRating} label="Your rating" />
        </div>
        {rating && (
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-300 mt-1"
            onClick={() => setRating(undefined)}
          >
            Clear rating
          </button>
        )}
        {errors.rating && <p className="text-red-400 text-xs mt-1" role="alert">{errors.rating}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="text-sm font-medium text-gray-300 mb-2 block">
          Notes <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="Your thoughts…"
          maxLength={1000}
          aria-describedby="notes-count"
        />
        <p id="notes-count" className="text-xs text-gray-600 text-right mt-1">{notes.length}/1000</p>
        {errors.notes && <p className="text-red-400 text-xs" role="alert">{errors.notes}</p>}
      </div>

      {errors.form && (
        <p className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-800" role="alert">
          {errors.form}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
