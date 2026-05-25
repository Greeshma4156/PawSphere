import React from 'react'

export default function CapacityCard({ total, occupied }) {
  const totalSafe = Number(total || 0)
  const occupiedSafe = Number(occupied || 0)
  const percent = totalSafe > 0 ? Math.round((occupiedSafe / totalSafe) * 100) : 0

  return (
    <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Capacity</div>
          <div className="mt-2 text-lg font-extrabold text-dark dark:text-cream">{occupiedSafe} / {totalSafe}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Usage</div>
          <div className="mt-2 text-lg font-extrabold text-lavender">{percent}%</div>
        </div>
      </div>
      <div className="mt-4 h-2 bg-beige/20 dark:bg-white/5 rounded-full overflow-hidden border border-lavender/10">
        <div
          className="h-full bg-lavender"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  )
}

