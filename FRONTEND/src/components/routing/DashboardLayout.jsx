import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'

export default function DashboardLayout({ role, title, subtitle, rightSlot }) {
  const { user } = useUIStore()

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <div className="rounded-[2rem] bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-6 shadow-xl shadow-lavender/10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender">{role.toUpperCase()}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {user?.name ? `Signed in: ${user.name}` : 'Connected'}
                </span>
              </div>
              <h1 className="mt-3 font-extrabold font-outfit text-2xl md:text-3xl text-dark dark:text-cream">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
            {rightSlot ? <div className="min-w-[220px]">{rightSlot}</div> : null}
          </div>
        </div>

        {/* Content */}
        <Outlet />
      </motion.div>
    </div>
  )
}

