import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { Sun, Moon, Menu, X, LogOut, MapPin, Heart, LayoutDashboard, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { user, theme, toggleTheme, setUser, notifications, markNotificationsRead, clearNotifications } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    setUser(null, null);
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isLinkActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/dashboard/${user.role}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-cream/80 dark:bg-dark/85 backdrop-blur-lg border-b border-lavender/25 shadow-lg py-2' 
        : 'bg-cream/45 dark:bg-dark/45 backdrop-blur-md border-b border-lavender/10 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div 
            className="w-10 h-10 rounded-2xl bg-lavender flex items-center justify-center text-xl shadow-md shadow-lavender/35"
            whileHover={{ rotate: [0, 15, -15, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            🐾
          </motion.div>
          <span className="font-outfit text-xl font-extrabold tracking-tight text-dark dark:text-cream">
            Paw<span className="text-lavender">Sphere</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`font-semibold text-sm flex items-center gap-1.5 transition-colors relative py-1 ${
              isLinkActive('/') ? 'text-lavender font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
            }`}
          >
            Home
            {isLinkActive('/') && <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lavender rounded-full" />}
          </Link>
          <Link
            to="/map"
            className={`font-semibold text-sm flex items-center gap-1.5 transition-colors relative py-1 ${
              isLinkActive('/map') ? 'text-lavender font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
            }`}
          >
            <MapPin className="w-4 h-4" /> Rescue Map
            {isLinkActive('/map') && <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lavender rounded-full" />}
          </Link>
          <Link
            to="/donations"
            className={`font-semibold text-sm flex items-center gap-1.5 transition-colors relative py-1 ${
              isLinkActive('/donations') ? 'text-lavender font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
            }`}
          >
            <Heart className="w-4 h-4" /> Medical Funding
            {isLinkActive('/donations') && <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lavender rounded-full" />}
          </Link>
          <Link
            to="/adoptions"
            className={`font-semibold text-sm flex items-center gap-1.5 transition-colors relative py-1 ${
              isLinkActive('/adoptions') ? 'text-lavender font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
            }`}
          >
            Adoption Portal
            {isLinkActive('/adoptions') && <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lavender rounded-full" />}
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              className={`font-semibold text-sm flex items-center gap-1.5 transition-colors relative py-1 ${
                location.pathname.startsWith('/dashboard') ? 'text-lavender font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Console
              {location.pathname.startsWith('/dashboard') && <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lavender rounded-full" />}
            </Link>
          )}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4 relative">
          
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl hover:bg-lavender/10 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Toggle theme mode"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-peach animate-spin-slow" />}
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications) markNotificationsRead();
              }}
              className="p-2.5 rounded-2xl hover:bg-lavender/10 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer relative hover:scale-105 active:scale-95"
              aria-label="Notifications"
            >
              <span>🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-cream dark:border-dark animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-dark/95 backdrop-blur-md border border-lavender/25 dark:border-white/10 rounded-3xl p-4 shadow-2xl z-50 text-left"
                >
                  <div className="flex items-center justify-between border-b border-lavender/15 pb-2.5 mb-2.5">
                    <h4 className="font-extrabold font-outfit text-sm text-dark dark:text-cream">Alert Feed</h4>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] font-extrabold text-red-400 hover:text-red-500 uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-400">
                        <span className="text-xl block mb-1">🕊️</span>
                        All quiet in the sphere.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="text-xs p-2 rounded-xl bg-beige/35 dark:bg-white/5 border border-lavender/5">
                          <div className="font-extrabold text-dark dark:text-cream flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[9px] font-normal text-gray-400">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-lavender/10 dark:bg-white/5 p-1.5 pr-4 rounded-full border border-lavender/20">
              <div className="w-8 h-8 rounded-full bg-lavender/25 text-lavender flex items-center justify-center font-bold text-xs border border-lavender/30 select-none uppercase">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-dark dark:text-cream leading-tight">{user.name}</span>
                <span className="text-[10px] text-lavender font-semibold capitalize leading-none">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-lavender transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-lavender text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-lavender-light hover:text-lavender transition-all shadow-md shadow-lavender/20 font-outfit"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-peach" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-cream dark:bg-dark border-b border-lavender/10 dark:border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4 font-outfit">
              <Link
                to="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold flex items-center gap-2 py-2"
              >
                <MapPin className="w-5 h-5 text-lavender" /> Rescue Map
              </Link>
              <Link
                to="/donations"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold flex items-center gap-2 py-2"
              >
                <Heart className="w-5 h-5 text-lavender" /> Medical Funding
              </Link>
              <Link
                to="/adoptions"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold flex items-center gap-2 py-2"
              >
                🐾 Adoption Portal
              </Link>
              {user && (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold flex items-center gap-2 py-2"
                >
                  <LayoutDashboard className="w-5 h-5 text-lavender" /> Dashboard
                </Link>
              )}
              
              <hr className="border-gray-100 dark:border-gray-800 my-2" />

              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lavender/25 text-lavender flex items-center justify-center font-bold text-sm border border-lavender/30 select-none uppercase">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-dark dark:text-cream leading-tight">{user.name}</span>
                      <span className="text-xs text-lavender font-semibold capitalize">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-full font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 border border-lavender/30 rounded-full font-bold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-lavender text-white py-3 rounded-full font-bold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav bar for Mobile Devices */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/80 dark:bg-dark/80 backdrop-blur-lg border border-lavender/20 dark:border-white/5 rounded-full p-2 flex items-center justify-around shadow-2xl shadow-lavender/10">
        <Link to="/" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-lavender">
          <span className="text-xl">🏠</span>
          <span className="text-[9px] font-semibold mt-0.5">Home</span>
        </Link>
        <Link to="/map" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-lavender">
          <span className="text-xl">🗺️</span>
          <span className="text-[9px] font-semibold mt-0.5">Map</span>
        </Link>
        <Link to="/donations" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-lavender">
          <span className="text-xl">💝</span>
          <span className="text-[9px] font-semibold mt-0.5">Donate</span>
        </Link>
        <Link to="/adoptions" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-lavender">
          <span className="text-xl">🐾</span>
          <span className="text-[9px] font-semibold mt-0.5">Adopt</span>
        </Link>
        {user ? (
          <Link to={getDashboardPath()} className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-lavender">
            <span className="text-xl">📊</span>
            <span className="text-[9px] font-semibold mt-0.5">Console</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-lavender">
            <span className="text-xl">🔑</span>
            <span className="text-[9px] font-semibold mt-0.5">Login</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
