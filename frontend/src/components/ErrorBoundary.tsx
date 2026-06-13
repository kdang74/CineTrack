import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message?: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center" role="alert">
          <AlertTriangle size={40} className="text-red-500 mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md">
            An unexpected error occurred. Please refresh the page or try again later.
          </p>
          <button
            className="btn-secondary"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
