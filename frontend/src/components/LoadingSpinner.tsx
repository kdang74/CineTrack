import { Loader2 } from 'lucide-react'

interface Props {
  size?: number
  text?: string
  fullPage?: boolean
}

export default function LoadingSpinner({ size = 32, text = 'Loading…', fullPage = false }: Props) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-gray-400" role="status" aria-live="polite">
      <Loader2 size={size} className="animate-spin text-brand-500" aria-hidden="true" />
      <span className="text-sm">{text}</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm z-50">
        {content}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-16">{content}</div>
}
