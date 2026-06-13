import { Star } from 'lucide-react'

interface Props {
  value: number | null | undefined
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: number
  label?: string
}

export default function RatingStars({ value, onChange, readonly = false, size = 16, label = 'Rating' }: Props) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={label}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-125 cursor-pointer'}`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          aria-pressed={value === star}
        >
          <Star
            size={size}
            className={`transition-colors ${
              value && star <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
      {value && (
        <span className="ml-1 text-xs text-gray-400" aria-live="polite">{value}/10</span>
      )}
    </div>
  )
}
