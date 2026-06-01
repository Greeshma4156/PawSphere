import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldAlert, MapPin, Sparkles, Heart, Syringe, ClipboardList, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

import { useUIStore } from '../store/uiStore'
import {
  getShelterCapacity,
  getIncomingRescueQueue,
  intakeRescue,
  getAdoptions,
  getMedicalPassports,
  getFosterRequests,
  addMedicalLog,
  addVaccination,
  approveFoster,
  rejectFoster,
} from '../services/shelterService'
import { useSocketEvents } from '../services/socketService'
import { SOCKET_EVENTS } from '../shared/socketEvents'

import CapacityCard from '../components/shelter/CapacityCard'
import EmptyState from '../components/common/EmptyState'
import MedicalPassportCard from '../components/shelter/MedicalPassportCard'

// ── Small form sub-components ──────────────────────────────────────────────

function MedicalLogForm({ petId, onSuccess }) {
  const [notes, setNotes] = useState('')
  const [treatment, setTreatment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!notes.trim()) return
    setLoading(true)
    try {
      await addMedicalLog(petId, { notes: notes.trim(), treatment: treatment.trim() })
      setNotes('')
      setTreatment('')
      onSuccess?.()
    } catch { /* swallow */ } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Health observation notes…"
        rows={2}
        className="w-full text-xs rounded-xl bg-beige/30 dark:bg-white/5 border border-lavender/15 px-3 py-2 text-dark dark:text-cream resize-none focus:outline-none focus:border-lavender/40"
      />
      <input
        value={treatment}
        onChange={(e) => setTreatment(e.target.value)}
        placeholder="Treatment given (optional)"
        className="w-full text-xs rounded-xl bg-beige/30 dark:bg-white/5 border border-lavender/15 px-3 py-2 text-dark dark:text-cream focus:outline-none focus:border-lavender/40"
      />
      <button
        type="submit"
        disabled={loading || !notes.trim()}
        className="w-full px-3 py-2 rounded-xl bg-lavender text-white text-[10px] font-extrabold hover:bg-lavender/80 disabled:opacity-40 transition-all"
      >
        {loading ? 'Saving…' : 'Add Health Log'}
      </button>
    </form>
  )
}

function VaccinationForm({ petId, onSuccess }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !date) return
    setLoading(true)
    try {
      await addVaccination(petId, { name: name.trim(), date, status: 'completed' })
      setName('')
      setDate('')
      onSuccess?.()
    } catch { /* swallow */ } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Vaccine name (e.g. Rabies)"
        className="w-full text-xs rounded-xl bg-beige/30 dark:bg-white/5 border border-lavender/15 px-3 py-2 text-dark dark:text-cream focus:outline-none focus:border-lavender/40"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full text-xs rounded-xl bg-beige/30 dark:bg-white/5 border border-lavender/15 px-3 py-2 text-dark dark:text-cream focus:outline-none focus:border-lavender/40"
      />
      <button
        type="submit"
        disabled={loading || !name.trim() || !date}
        className="w-full px-3 py-2 rounded-xl bg-peach text-white text-[10px] font-extrabold hover:bg-peach/80 disabled:opacity-40 transition-all"
      >
        {loading ? 'Saving…' : 'Add Vaccination'}
      </button>
    </form>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function ShelterDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUIStore()

  // Which passport card is expanded for updates
  const [expandedPassport, setExpandedPassport] = useState(null)
  const [activeTab, setActiveTab] = useState('log') // 'log' | 'vaccine'

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: capResp, isLoading: capLoading } = useQuery({
    queryKey: ['shelter_capacity'],
    queryFn: () => getShelterCapacity().then((r) => r.data || r),
  })
  const capacity = capResp || {}

  const { data: queueResp, isLoading: queueLoading } = useQuery({
    queryKey: ['shelter_incoming_queue'],
    queryFn: () => getIncomingRescueQueue().then((r) => r.data || r),
  })
  const incomingQueue = Array.isArray(queueResp?.data) ? queueResp.data : Array.isArray(queueResp) ? queueResp : []

  const { data: passportsResp, isLoading: passportsLoading } = useQuery({
    queryKey: ['shelter_medical_passports'],
    queryFn: () => getMedicalPassports().then((r) => r.data || r),
  })
  const passports = Array.isArray(passportsResp?.data) ? passportsResp.data : Array.isArray(passportsResp) ? passportsResp : []

  const { data: fostersResp, isLoading: fostersLoading } = useQuery({
    queryKey: ['shelter_foster_requests'],
    queryFn: () => getFosterRequests().then((r) => r.data || r),
  })
  const fosters = Array.isArray(fostersResp?.data) ? fostersResp.data : Array.isArray(fostersResp) ? fostersResp : []

  // ── Mutations ────────────────────────────────────────────────────────────
  const invalidateShelter = () => {
    queryClient.invalidateQueries({ queryKey: ['shelter_capacity'] })
    queryClient.invalidateQueries({ queryKey: ['shelter_incoming_queue'] })
    queryClient.invalidateQueries({ queryKey: ['shelter_medical_passports'] })
  }

  const handleIntake = async (rescueId) => {
    if (!rescueId) return
    try {
      await intakeRescue(rescueId)
      invalidateShelter()
    } catch { /* error handled by axios interceptor */ }
  }

  const fosterMutation = useMutation({
    mutationFn: ({ fosterId, action }) =>
      action === 'approve' ? approveFoster(fosterId) : rejectFoster(fosterId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shelter_foster_requests'] }),
  })

  useSocketEvents({
    enabled: true,
    eventNames: [SOCKET_EVENTS.RESCUE_CLAIMED, SOCKET_EVENTS.RESCUE_UPDATED, SOCKET_EVENTS.RESCUE_STATUS_UPDATED],
    onEvent: () => invalidateShelter(),
  })

  const statusColors = {
    pending: 'text-amber-500',
    approved: 'text-emerald-500',
    rejected: 'text-red-500',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20">
            <ShieldAlert className="w-4 h-4 text-lavender" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender">Shelter Console</span>
          </div>
          <h1 className="mt-3 font-extrabold font-outfit text-2xl md:text-3xl text-dark dark:text-cream">
            Intake &amp; Medical Passports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Capacity tracking · rescued intake · passport updates · foster queue
          </p>
        </div>
        <button
          onClick={() => navigate('/map')}
          className="px-4 py-2.5 rounded-2xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-xs font-bold hover:bg-lavender/10 transition-all"
        >
          <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> Open Live Map</span>
        </button>
      </div>

      {/* ── Row 1: Capacity + Intake Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Capacity */}
        <section>
          {capLoading ? (
            <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5 animate-pulse h-40" />
          ) : (
            <CapacityCard total={capacity.total} occupied={capacity.occupied} />
          )}
        </section>

        {/* Intake Queue */}
        <section className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-lavender" />
              <h3 className="font-extrabold text-dark dark:text-cream">Intake Queue</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {queueLoading ? '…' : `${incomingQueue.length} waiting`}
            </span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {queueLoading ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">Loading queue…</div>
            ) : incomingQueue.length === 0 ? (
              <EmptyState title="No rescued animals awaiting intake" subtitle='When a mission reaches "rescued", it appears here.' />
            ) : (
              incomingQueue.slice(0, 10).map((r) => (
                <div key={r._id} className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{r.animalType} · rescued</div>
                      <div className="mt-0.5 text-xs font-extrabold text-dark dark:text-cream truncate">{r.title}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{r.address || 'Address unknown'}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="text-[10px] font-bold text-lavender">P:{r.priorityScore ?? 0}</div>
                      <button
                        onClick={() => handleIntake(r._id)}
                        className="px-3 py-1.5 rounded-xl bg-lavender text-white text-[10px] font-extrabold hover:bg-lavender/80 transition-all"
                      >
                        Intake ↗
                      </button>
                      <button
                        onClick={() => navigate(`/rescue/${r._id}`)}
                        className="px-3 py-1.5 rounded-xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-[10px] font-bold hover:bg-lavender/10 transition-all"
                      >
                        View Case
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Row 2: Medical Passports ── */}
      <section className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-lavender" />
            <h3 className="font-extrabold text-dark dark:text-cream">Medical Passports</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {passportsLoading ? '…' : `${passports.length} animals`}
          </span>
        </div>

        {passportsLoading ? (
          <div className="text-xs text-gray-500">Loading passports…</div>
        ) : passports.length === 0 ? (
          <EmptyState title="No passport cards yet" subtitle="Complete intake to generate medical passports." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {passports.map((passport) => {
              const isExpanded = expandedPassport === passport._id
              return (
                <div key={passport._id || passport.medicalPassportId} className="rounded-2xl bg-beige/10 dark:bg-white/5 border border-lavender/10 overflow-hidden">
                  <MedicalPassportCard passport={passport} />

                  {/* Expand toggle */}
                  <button
                    onClick={() => {
                      setExpandedPassport(isExpanded ? null : passport._id)
                      setActiveTab('log')
                    }}
                    className="w-full flex items-center justify-center gap-1 py-2 border-t border-lavender/10 text-[10px] font-bold text-lavender hover:bg-lavender/5 transition-all"
                  >
                    {isExpanded ? <><ChevronUp className="w-3 h-3" /> Hide Update Panel</> : <><ChevronDown className="w-3 h-3" /> Update Passport</>}
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-lavender/10 bg-beige/20 dark:bg-white/3">
                      {/* Tab switcher */}
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setActiveTab('log')}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${activeTab === 'log' ? 'bg-lavender text-white' : 'bg-beige/40 dark:bg-white/5 text-gray-500'}`}
                        >
                          <Heart className="w-3 h-3" /> Health Log
                        </button>
                        <button
                          onClick={() => setActiveTab('vaccine')}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${activeTab === 'vaccine' ? 'bg-peach text-white' : 'bg-beige/40 dark:bg-white/5 text-gray-500'}`}
                        >
                          <Syringe className="w-3 h-3" /> Vaccination
                        </button>
                      </div>

                      {activeTab === 'log' ? (
                        <MedicalLogForm
                          petId={passport._id}
                          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['shelter_medical_passports'] })}
                        />
                      ) : (
                        <VaccinationForm
                          petId={passport._id}
                          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['shelter_medical_passports'] })}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Row 3: Foster Queue ── */}
      <section className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-peach" />
            <h3 className="font-extrabold text-dark dark:text-cream">Foster Applications</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {fostersLoading ? '…' : `${fosters.length} applications`}
          </span>
        </div>

        {fostersLoading ? (
          <div className="text-xs text-gray-500">Loading foster requests…</div>
        ) : fosters.length === 0 ? (
          <EmptyState
            title="No foster applications yet"
            subtitle="When citizens apply to foster a pet, their requests appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fosters.map((f) => (
              <div key={f._id} className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-dark dark:text-cream truncate">
                      {f.pet?.name || 'Unknown Pet'}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {f.pet?.animalType} · {f.pet?.breed || 'Mixed Breed'}
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${statusColors[f.status] || 'text-gray-400'}`}>
                    {f.status}
                  </span>
                </div>

                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-dark dark:text-cream">{f.applicant?.name || 'Applicant'}</span>
                  {f.applicant?.email ? ` · ${f.applicant.email}` : ''}
                </div>

                {f.message && (
                  <p className="text-[10px] italic text-gray-500 dark:text-gray-400 line-clamp-2">"{f.message}"</p>
                )}

                {f.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => fosterMutation.mutate({ fosterId: f._id, action: 'approve' })}
                      disabled={fosterMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-extrabold hover:bg-emerald-600 disabled:opacity-40 transition-all"
                    >
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => fosterMutation.mutate({ fosterId: f._id, action: 'reject' })}
                      disabled={fosterMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-500 text-white text-[10px] font-extrabold hover:bg-red-600 disabled:opacity-40 transition-all"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
