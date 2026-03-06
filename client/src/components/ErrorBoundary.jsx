import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('UI error boundary', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
            <div className="text-sm font-semibold text-emerald-700">Something went wrong</div>
            <div className="mt-2 text-2xl font-semibold">Please refresh the page</div>
            <div className="mt-2 text-gray-600">
              If the issue persists, try logging out and logging back in.
            </div>
            <button
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

