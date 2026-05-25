import React from 'react'

const STATUS_COLORS = {
  assigned: 'bg-lavender/10 border border-lavender/25 text-lavender',
  on_the_way: 'bg-orange-500/10 border border-orange-500/25 text-orange-500',
  rescued: 'bg-mint/10 border border-mint/25 text-emerald-700',
  treatment: 'bg-amber-400/10 border border-amber-400/25 text-amber-600',
  safe: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-700',
}

export default function VolunteerStatusPill({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-beige/30 border border-lavender/15 text-dark'
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${cls}`}>
      {String(status || '').replace(/_/g, ' ')}
    </span>
  )
}

