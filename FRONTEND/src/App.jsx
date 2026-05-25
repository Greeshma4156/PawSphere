import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUIStore } from './store/uiStore'


// Layouts & Common
import Navbar from './components/common/Navbar'
import ErrorBoundary from './components/common/ErrorBoundary'
import SOSButton from './components/common/SOSButton'
import ToastManager from './components/common/ToastManager'

// Route-Based Code Splitting
const Landing = React.lazy(() => import('./pages/Landing'))
const Login = React.lazy(() => import('./pages/Login'))
const Signup = React.lazy(() => import('./pages/Signup'))
const CitizenDashboard = React.lazy(() => import('./pages/CitizenDashboard'))
const VolunteerDashboard = React.lazy(() => import('./pages/VolunteerDashboard'))
const ShelterDashboard = React.lazy(() => import('./pages/ShelterDashboard'))
const DonationPortal = React.lazy(() => import('./pages/DonationPortal'))
const RescueMap = React.lazy(() => import('./pages/RescueMap'))
const RescueCasePage = React.lazy(() => import('./pages/RescueCasePage'))

// Dashboard shell
const DashboardLayout = React.lazy(() => import('./components/routing/DashboardLayout'))

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
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  return children
}

function App() {
  const { theme, setOnlineStatus } = useUIStore()

  // Manage Theme & Online Connection Status
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [theme, setOnlineStatus])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-cream text-dark transition-colors duration-300 dark:bg-dark dark:text-cream flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-20 pb-16 md:pb-6 relative z-0">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-lavender-light border-t-lavender rounded-full animate-spin" />
                    </div>
                  </div>
                }
              >
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Dashboard shells */}
                  <Route
                    path="/dashboard/citizen"
                    element={
                      <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                        <DashboardLayout
                          role="citizen"
                          title="Citizen Console"
                          subtitle="Report emergencies and monitor rescue timelines."
                        />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<CitizenDashboard />} />
                    <Route path="rescue/:id" element={<RescueCasePage />} />
                  </Route>

                  <Route
                    path="/dashboard/volunteer"
                    element={
                      <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                        <DashboardLayout
                          role="volunteer"
                          title="Volunteer Console"
                          subtitle="Claim cases, coordinate progress, and update status."
                        />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<VolunteerDashboard />} />
                    <Route path="rescue/:id" element={<RescueCasePage />} />
                  </Route>

                  <Route
                    path="/dashboard/shelter"
                    element={
                      <ProtectedRoute allowedRoles={['shelter', 'admin']}>
                        <DashboardLayout
                          role="shelter"
                          title="Shelter Console"
                          subtitle="Manage intake, capacity, and medical campaigns."
                        />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<ShelterDashboard />} />
                    <Route path="rescue/:id" element={<RescueCasePage />} />
                  </Route>

                  {/* Shared routes */}
                  <Route
                    path="/donations"
                    element={
                      <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'shelter', 'admin']}>
                        <DonationPortal />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/map"
                    element={
                      <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'shelter', 'admin']}>
                        <RescueMap />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rescue workspace deep link */}
                  <Route
                    path="/rescue/:id"
                    element={
                      <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'shelter', 'admin']}>
                        <RescueCasePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            <ToastManager />
            <SOSButton />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App

