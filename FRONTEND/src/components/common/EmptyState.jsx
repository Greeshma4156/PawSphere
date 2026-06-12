import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function EmptyState({ title, subtitle, icon, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[2rem] bg-gradient-to-br from-white/60 via-beige/20 to-lavender/5 dark:from-dark/60 dark:via-dark/40 dark:to-lavender/5 backdrop-blur-md border border-lavender/15 dark:border-white/5 p-8 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-lavender/10 border border-lavender/20 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6 text-lavender/60" />}
      </div>
      <div className="text-sm font-bold text-dark dark:text-cream">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed max-w-xs">{subtitle}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}
