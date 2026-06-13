import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center" role="status">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-md mb-6">{description}</p>}
      {action}
    </div>
  )
}
