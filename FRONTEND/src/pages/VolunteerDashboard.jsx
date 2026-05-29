import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, MapPin, ShieldAlert, CheckCircle2, Clock, Bell, TrendingUp } from 'lucide-react'

import { useUIStore } from '../store/uiStore'
import {
  setVolunteerAvailability,
  claimRescue,
  updateRescueStatus,
  getNearbyQueue,
  getAssignedMissions,
  getVolunteerStats,
} from '../services/volunteerService'
import { useSocketEvents } from '../services/socketService'
import { SOCKET_EVENTS } from '../shared/socketEvents'
import VolunteerStatusPill from '../components/volunteer/VolunteerStatusPill'
import EmptyState from '../components/common/EmptyState'

const STATUS_ORDER = ['assigned', 'on_the_way', 'rescued', 'treatment', 'safe']

export default function VolunteerDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUIStore()

  const [localAvailability, setLocalAvailability] = useState('offline')
  const [busyAvailability, setBusyAvailability] = useState(false)

  const [claimBusyId, setClaimBusyId] = useState(null)
  const [statusBusyId, setStatusBusyId] = useState(null)

  const { data: queueResp, isLoading: queueLoading } = useQuery({
    queryKey: ['nearby_rescues_queue'],
    queryFn: () => getNearbyQueue().then((r) => r.data || r),
  })

  const nearbyQueue = Array.isArray(queueResp?.data)
    ? queueResp.data
    : Array.isArray(queueResp)
      ? queueResp
      : []

  const { data: missionsResp, isLoading: missionsLoading } = useQuery({
    queryKey: ['assigned_missions'],
    queryFn: () => getAssignedMissions().then((r) => r.data || r),
  })

  const assignedMissions = Array.isArray(missionsResp?.data)
    ? missionsResp.data
    : Array.isArray(missionsResp)
      ? missionsResp
      : []

  const { data: statsResp, isLoading: statsLoading } = useQuery({
    queryKey: ['volunteer_stats'],
    queryFn: () => getVolunteerStats().then((r) => r.data || r),
  })

  const stats = statsResp || {}

  useEffect(() => {
    if (user?.availability) setLocalAvailability(user.availability)
  }, [user?.availability])

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['nearby_rescues_queue'] })
    queryClient.invalidateQueries({ queryKey: ['assigned_missions'] })
    queryClient.invalidateQueries({ queryKey: ['volunteer_stats'] })
  }

  useSocketEvents({
    enabled: true,
    eventNames: [SOCKET_EVENTS.RESCUE_CLAIMED, SOCKET_EVENTS.RESCUE_UPDATED, SOCKET_EVENTS.RESCUE_STATUS_UPDATED, 'volunteer:availability'],
    onEvent: (evt, payload) => {
      if (!payload) {
        invalidateAll()
        return
      }
      // For this phase we keep it simple and refresh relevant caches.
      invalidateAll()
    },
  })

  const handleToggleAvailability = async () => {
    if (busyAvailability) return
    setBusyAvailability(true)
    try {
      const next = localAvailability === 'online' ? 'offline' : 'online'
      await setVolunteerAvailability({ availability: next })
      setLocalAvailability(next)
      queryClient.invalidateQueries({ queryKey: ['volunteer_stats'] })
    } catch (e) {
      // revert UI on failure
      setLocalAvailability((prev) => (prev === 'online' ? 'offline' : 'online'))
    } finally {
      setBusyAvailability(false)
    }
  }

  const handleClaim = async (rescueId) => {
    if (!rescueId || claimBusyId) return
    setClaimBusyId(rescueId)
    try {
      await claimRescue(rescueId)
      await queryClient.invalidateQueries({ queryKey: ['nearby_rescues_queue'] })
      await queryClient.invalidateQueries({ queryKey: ['assigned_missions'] })
      await queryClient.invalidateQueries({ queryKey: ['volunteer_stats'] })
    } finally {
      setClaimBusyId(null)
    }
  }

  const handleStatusUpdate = async (rescueId, nextStatus) => {
    if (!rescueId || !nextStatus) return
    setStatusBusyId(rescueId)
    try {
      await updateRescueStatus({ rescueId, status: nextStatus })
      await queryClient.invalidateQueries({ queryKey: ['assigned_missions'] })
      await queryClient.invalidateQueries({ queryKey: ['nearby_rescues_queue'] })
      await queryClient.invalidateQueries({ queryKey: ['volunteer_stats'] })
      // Also refresh the rescue workspace details
      await queryClient.invalidateQueries({ queryKey: ['rescue_details', rescueId] })
    } finally {
      setStatusBusyId(null)
    }
  }

  const currentAvailability = localAvailability

  const nextPossibleStatus = (status) => {
    const idx = STATUS_ORDER.indexOf(status)
    if (idx < 0) return null
    return STATUS_ORDER[idx + 1] || null
  }

  const computedBadges = useMemo(() => {
    const badges = Array.isArray(stats?.badges) ? stats.badges : []
    return badges
  }, [stats?.badges])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20">
            <ShieldAlert className="w-4 h-4 text-lavender" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender">Volunteer Console</span>
          </div>
          <h1 className="mt-3 font-extrabold font-outfit text-2xl md:text-3xl text-dark dark:text-cream">Mission Operations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Availability, claims, status transitions, and live assignment updates.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            onClick={handleToggleAvailability}
            disabled={busyAvailability}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              currentAvailability === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                : 'bg-beige/40 dark:bg-white/5 border-lavender/15 text-dark dark:text-cream'
            } hover:shadow-sm`}
          >
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {busyAvailability
                ? 'Updating…'
                : currentAvailability === 'online'
                  ? 'Go Offline'
                  : 'Go Online'}
            </span>
          </button>

          <Link
            to="/map"
            className="px-4 py-2.5 rounded-2xl bg-lavender text-white text-xs font-extrabold hover:bg-lavender-light transition-all"
          >
            Open Live Map
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats */}
        <section className="lg:col-span-1 space-y-4">
          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-lavender" />
                <h3 className="font-extrabold text-dark dark:text-cream">Volunteer Analytics</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {statsLoading ? 'Loading…' : 'Live'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Completed</div>
                <div className="mt-2 text-lg font-extrabold text-lavender">{stats?.rescuesCompleted ?? 0}</div>
              </div>
              <div className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Streak</div>
                <div className="mt-2 text-lg font-extrabold text-dark dark:text-cream">{stats?.streak ?? 0}</div>
              </div>
            </div>

            {computedBadges?.length ? (
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Badges</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {computedBadges.slice(0, 6).map((b) => (
                    <span key={b.id || b.type || b.name} className="px-3 py-1 rounded-full bg-lavender/10 border border-lavender/25 text-[10px] font-bold text-lavender">
                      {b.name || b.type || b.id}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-peach" />
              <h3 className="font-extrabold text-dark dark:text-cream">Live Notifications</h3>
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Assignment and status changes will refresh your queue and missions automatically.
            </div>
          </div>
        </section>

        {/* Middle: Nearby queue */}
        <section className="lg:col-span-1 space-y-4">
          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-lavender" />
                <h3 className="font-extrabold text-dark dark:text-cream">Nearby Pending Rescues</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{queueLoading ? '…' : nearbyQueue.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {queueLoading ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">Loading queue…</div>
              ) : nearbyQueue.length === 0 ? (
                <EmptyState title="No pending rescues" subtitle="Go online to receive new assignment opportunities." />
              ) : (
                nearbyQueue.slice(0, 8).map((r) => (
                  <div key={r._id} className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{r.animalType} • pending</div>
                        <div className="mt-1 text-xs font-extrabold text-dark dark:text-cream truncate">{r.title}</div>
                        <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{r.address || 'Address unknown'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-lavender">P:{r.priorityScore ?? 0}</div>
                        <div className="mt-2">
                          <button
                            disabled={claimBusyId === r._id}
                            onClick={() => handleClaim(r._id)}
                            className="px-3 py-2 rounded-xl bg-lavender text-white text-[10px] font-extrabold hover:bg-lavender-light transition-all disabled:opacity-50"
                          >
                            {claimBusyId === r._id ? 'Claiming…' : 'Claim'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/rescue/${r._id}`}
                        className="flex-1 px-3 py-2 rounded-xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-[10px] font-bold hover:bg-lavender/10 transition-all text-center"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => navigate(`/map`)}
                        className="px-3 py-2 rounded-xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-[10px] font-bold hover:bg-lavender/10 transition-all"
                      >
                        Map
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right: Assigned missions */}
        <section className="lg:col-span-1 space-y-4">
          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-lavender" />
                <h3 className="font-extrabold text-dark dark:text-cream">Assigned Missions</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{missionsLoading ? '…' : assignedMissions.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {missionsLoading ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">Loading missions…</div>
              ) : assignedMissions.length === 0 ? (
                <EmptyState title="No assigned missions" subtitle="Claim a pending rescue to start updating its mission status." />
              ) : (
                assignedMissions
                  .slice(0, 10)
                  .map((r) => {
                    const next = nextPossibleStatus(r.status)
                    return (
                      <div key={r._id} className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{r.animalType}</div>
                            <div className="mt-1 text-xs font-extrabold text-dark dark:text-cream truncate">{r.title}</div>
                            <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{r.address || 'Address unknown'}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <VolunteerStatusPill status={r.status} />
                            <div className="text-[10px] font-bold text-lavender">P:{r.priorityScore ?? 0}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!next || statusBusyId === r._id}
                            onClick={() => handleStatusUpdate(r._id, next)}
                            className="flex-1 px-3 py-2 rounded-xl bg-lavender text-white text-[10px] font-extrabold hover:bg-lavender-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {next ? (statusBusyId === r._id ? 'Updating…' : `Advance → ${String(next).replace(/_/g, ' ')}`) : 'Final status reached'}
                          </button>
                          <Link
                            to={`/rescue/${r._id}`}
                            className="px-3 py-2 rounded-xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-[10px] font-bold hover:bg-lavender/10 transition-all text-center"
                          >
                            Open
                          </Link>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Tap “Advance” to update timeline and mission state.</span>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

