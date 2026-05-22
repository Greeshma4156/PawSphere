import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUIStore } from './store/uiStore'

// Layouts & Common
import Navbar from './components/common/Navbar'
import ErrorBoundary from './components/common/ErrorBoundary'
import SOSButton from './components/common/SOSButton'

// Route-Based Code Splitting (Phase 7 early setup)
const Landing = React.lazy(() => import('./pages/Landing'))
const Login = React.lazy(() => import('./pages/Login'))
const Signup = React.lazy(() => import('./pages/Signup'))
const CitizenDashboard = React.lazy(() => import('./pages/CitizenDashboard'))
const VolunteerDashboard = React.lazy(() => import('./pages/VolunteerDashboard'))
const ShelterDashboard = React.lazy(() => import('./pages/ShelterDashboard'))
const DonationPortal = React.lazy(() => import('./pages/DonationPortal'))
const RescueMap = React.lazy(() => import('./pages/RescueMap'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useUIStore()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  // If volunteer is not verified yet, they can still access dashboard, but we'll show alerts
  return children
}

function App() {
  const { theme, setOnlineStatus } = useUIStore()

  // Manage Theme & Online Connection Status
  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Monitor Online Connectivity (Phase 6 Offline PWA sync prep)
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [theme])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-cream text-dark transition-colors duration-300 dark:bg-dark dark:text-cream flex flex-col font-sans">
            <Navbar />
            
            <main className="flex-grow pt-20 pb-16 md:pb-6 relative z-0">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[70vh]">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-lavender-light border-t-lavender rounded-full animate-spin"></div>
                  </div>
                </div>
              }>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Citizen routes */}
                  <Route path="/dashboard/citizen" element={
                    <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Volunteer routes */}
                  <Route path="/dashboard/volunteer" element={
                    <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Shelter routes */}
                  <Route path="/dashboard/shelter" element={
                    <ProtectedRoute allowedRoles={['shelter', 'admin']}>
                      <ShelterDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Shared Feature routes */}
                  <Route path="/donations" element={<DonationPortal />} />
                  <Route path="/map" element={<RescueMap />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            {/* SOS Button Float */}
            <SOSButton />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
