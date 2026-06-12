import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { Sparkles } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DashboardLayout({ role, title, subtitle }) {
  const { user } = useUIStore()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {/* ── Premium Dashboard Header ── */}
        <div className="relative rounded-[2rem] overflow-hidden">
          {/* Gradient background matching Hero style */}
          <div className="absolute inset-0 bg-gradient-to-tr from-lavender/20 via-peach/10 to-mint/10 dark:from-lavender/10 dark:via-dark dark:to-dark" />
          <div className="absolute top-1/2 -left-10 w-48 h-48 bg-lavender/15 rounded-full filter blur-3xl animate-float-slow" />
          <div className="absolute -bottom-4 right-10 w-36 h-36 bg-peach/15 rounded-full filter blur-3xl animate-float-reverse" />

          <div className="relative bg-white/40 dark:bg-dark/50 backdrop-blur-md border border-lavender/15 dark:border-white/5 rounded-[2rem] p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* Left: Greeting + title */}
              <div className="space-y-3">
                {/* Role badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-lavender/15 to-peach/15 border border-lavender/25 rounded-full">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender">
                    {role} Console
                  </span>
                </div>

                {/* Greeting */}
                <div>
                  <h1 className="font-extrabold font-outfit text-2xl md:text-3xl text-dark dark:text-cream flex items-center gap-2">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                    <Sparkles className="w-5 h-5 text-peach" />
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {subtitle} — <span className="text-lavender font-semibold">{formatDate()}</span>
                  </p>
                </div>
              </div>

              {/* Right: Avatar + info */}
              <div className="flex items-center gap-3 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 pr-5 border border-lavender/15 dark:border-white/5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-lavender to-peach text-white flex items-center justify-center font-bold text-sm font-outfit select-none shadow-md shadow-lavender/20">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-dark dark:text-cream leading-tight">{user?.name || 'User'}</span>
                  <span className="text-[10px] font-semibold text-lavender capitalize">{role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Dashboard Content ── */}
        <Outlet />
      </motion.div>
    </div>
  )
}
