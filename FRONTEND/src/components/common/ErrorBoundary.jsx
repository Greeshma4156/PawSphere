import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-beige p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md border border-lavender/20">
            <span className="text-6xl">⚠️</span>
            <h2 className="text-2xl font-bold mt-4 mb-2 text-dark font-outfit">Oops, something went wrong</h2>
            <p className="text-gray-600 mb-6 text-sm">
              An unexpected error occurred. Don't worry, the stray rescue operations are still running in the background!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-lavender text-white px-6 py-2.5 rounded-full font-semibold hover:bg-lavender-light hover:text-lavender transition-all font-outfit shadow-md shadow-lavender/30"
            >
              Refresh Platform
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
