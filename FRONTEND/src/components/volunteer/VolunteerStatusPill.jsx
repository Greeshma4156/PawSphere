import React from 'react'

const STATUS_COLORS = {
  assigned: 'bg-lavender/10 border border-lavender/25 text-lavender',
  on_the_way: 'bg-orange-500/10 border border-orange-500/25 text-orange-500',
  rescued: 'bg-mint/10 border border-mint/25 text-emerald-700',
  treatment: 'bg-mint/10 border border-mint/25 text-emerald-700',
  sheltered: 'bg-mint/10 border border-mint/25 text-emerald-700',
  safe: 'bg-mint/10 border border-mint/25 text-emerald-700',
  adopted: 'bg-mint/10 border border-mint/25 text-emerald-700',
}

const DISPLAY_STATUS = {
  pending: 'pending',
  assigned: 'assigned',
  on_the_way: 'on the way',
  rescued: 'rescued',
  treatment: 'rescued',
  sheltered: 'rescued',
  safe: 'rescued',
  adopted: 'rescued',
}

export default function VolunteerStatusPill({ status }) {
  const normalized = DISPLAY_STATUS[status] || String(status || '').replace(/_/g, ' ')
  const cls = STATUS_COLORS[status] || 'bg-beige/30 border border-lavender/15 text-dark'
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${cls}`}>
      {normalized}
    </span>
  )
}

