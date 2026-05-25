import React from 'react'

export default function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-[2rem] bg-white/60 dark:bg-dark/60 backdrop-blur-md border border-lavender/20 p-6">
      <div className="text-sm font-extrabold text-dark dark:text-cream">{title}</div>
      {subtitle ? <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{subtitle}</div> : null}
    </div>
  )
}

