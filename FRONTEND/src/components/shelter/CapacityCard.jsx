import React from 'react'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

export default function CapacityCard({ total, occupied }) {
  const totalSafe = Number(total || 0)
  const occupiedSafe = Number(occupied || 0)
  const percent = totalSafe > 0 ? Math.round((occupiedSafe / totalSafe) * 100) : 0
  const available = Math.max(0, totalSafe - occupiedSafe)

  // SVG ring math
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  // Color based on capacity usage
  const ringColor = percent > 85 ? '#ef4444' : percent > 60 ? '#f59e0b' : '#B79CFF'
  const ringBg = percent > 85 ? 'bg-red-500/10' : percent > 60 ? 'bg-amber-500/10' : 'bg-lavender/10'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-lavender/10 border border-lavender/20 flex items-center justify-center">
          <Home className="w-4 h-4 text-lavender" />
        </div>
        <h3 className="font-extrabold text-dark dark:text-cream text-sm">Shelter Capacity</h3>
      </div>

      <div className="flex items-center gap-6">
        {/* SVG Ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor"
              className="text-beige/40 dark:text-white/5" strokeWidth="8" />
            <circle cx="50" cy="50" r={radius} fill="none"
              stroke={ringColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="animate-progress-ring"
              style={{
                '--ring-circumference': circumference,
                '--ring-offset': offset,
                transition: 'stroke-dashoffset 1.2s ease-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-extrabold text-dark dark:text-cream font-outfit">{percent}%</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">used</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className={`rounded-xl ${ringBg} border border-lavender/10 p-3`}>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Occupied</div>
            <div className="text-lg font-extrabold text-dark dark:text-cream font-outfit mt-1">{occupiedSafe}</div>
          </div>
          <div className="rounded-xl bg-mint/20 border border-mint/30 p-3">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Available</div>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-outfit mt-1">{available}</div>
          </div>
          <div className="col-span-2 rounded-xl bg-beige/30 dark:bg-white/5 border border-lavender/10 p-3">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Capacity</div>
            <div className="text-lg font-extrabold text-dark dark:text-cream font-outfit mt-1">{totalSafe}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
