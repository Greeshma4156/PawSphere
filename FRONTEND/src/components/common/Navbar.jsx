import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { Sun, Moon, Menu, X, LogOut, MapPin, Heart, LayoutDashboard, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { user, theme, toggleTheme, setUser } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-cream/70 dark:bg-dark/70 backdrop-blur-md border-b border-lavender/10 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div 
            className="w-10 h-10 rounded-2xl bg-lavender flex items-center justify-center text-xl shadow-md shadow-lavender/30"
            whileHover={{ rotate: 12, scale: 1.05 }}
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
            to="/map"
            className={`font-medium text-sm flex items-center gap-1.5 transition-colors ${
              isLinkActive('/map') ? 'text-lavender font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
            }`}
          >
            <MapPin className="w-4 h-4" /> Rescue Map
          </Link>
          <Link
            to="/donations"
            className={`font-medium text-sm flex items-center gap-1.5 transition-colors ${
              isLinkActive('/donations') ? 'text-lavender font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
            }`}
          >
            <Heart className="w-4 h-4" /> Medical Funding
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              className={`font-medium text-sm flex items-center gap-1.5 transition-colors ${
                location.pathname.startsWith('/dashboard') ? 'text-lavender font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-lavender'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl hover:bg-lavender/10 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
            aria-label="Toggle theme mode"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-peach" />}
          </button>

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
