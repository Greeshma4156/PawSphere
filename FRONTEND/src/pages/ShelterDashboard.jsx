import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldAlert, MapPin, Sparkles } from 'lucide-react'

import { useUIStore } from '../store/uiStore'
import {
  getShelterCapacity,
  getIncomingRescueQueue,
  intakeRescue,
  getAdoptions,
  getMedicalPassports,
  getFosterRequests,
} from '../services/shelterService'
import { useSocketEvents } from '../services/socketService'
import { SOCKET_EVENTS } from '../shared/socketEvents'

import CapacityCard from '../components/shelter/CapacityCard'
import EmptyState from '../components/common/EmptyState'
import MedicalPassportCard from '../components/shelter/MedicalPassportCard'

export default function ShelterDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUIStore()

  const { data: capResp, isLoading: capLoading } = useQuery({
    queryKey: ['shelter_capacity'],
    queryFn: () => getShelterCapacity().then((r) => r.data || r),
  })

  const capacity = capResp || {}

  const { data: queueResp, isLoading: queueLoading } = useQuery({
    queryKey: ['shelter_incoming_queue'],
    queryFn: () => getIncomingRescueQueue().then((r) => r.data || r),
  })

  const incomingQueue = queueResp || []

  const { data: adoptionsResp, isLoading: adoptionsLoading } = useQuery({
    queryKey: ['shelter_adoptions'],
    queryFn: () => getAdoptions().then((r) => r.data || r),
  })

  const adoptions = adoptionsResp || []

  const { data: passportsResp, isLoading: passportsLoading } = useQuery({
    queryKey: ['shelter_medical_passports'],
    queryFn: () => getMedicalPassports().then((r) => r.data || r),
  })

  const passports = passportsResp || []

  const { data: fostersResp } = useQuery({
    queryKey: ['shelter_foster_requests'],
    queryFn: () => getFosterRequests().then((r) => r.data || r),
  })

  const fosters = fostersResp || []

  useSocketEvents({
    enabled: true,
    eventNames: [SOCKET_EVENTS.RESCUE_CLAIMED, SOCKET_EVENTS.RESCUE_UPDATED, SOCKET_EVENTS.RESCUE_STATUS_UPDATED],
    onEvent: (evt, payload) => {
      queryClient.invalidateQueries({ queryKey: ['shelter_incoming_queue'] })
      queryClient.invalidateQueries({ queryKey: ['shelter_adoptions'] })
      queryClient.invalidateQueries({ queryKey: ['shelter_medical_passports'] })
    }
  })

  const handleIntake = async (rescueId) => {
    if (!rescueId) return
    await intakeRescue(rescueId)
    await queryClient.invalidateQueries({ queryKey: ['shelter_capacity'] })
    await queryClient.invalidateQueries({ queryKey: ['shelter_incoming_queue'] })
    await queryClient.invalidateQueries({ queryKey: ['shelter_adoptions'] })
    await queryClient.invalidateQueries({ queryKey: ['shelter_medical_passports'] })
    await queryClient.invalidateQueries({ queryKey: ['rescue_details', rescueId] })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20">
            <ShieldAlert className="w-4 h-4 text-lavender" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender">Shelter Console</span>
          </div>
          <h1 className="mt-3 font-extrabold font-outfit text-2xl md:text-3xl text-dark dark:text-cream">Intake & Medical Passports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Capacity tracking, rescued intake, adoption listings, and passport cards.</p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2.5 rounded-2xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-xs font-bold hover:bg-lavender/10 transition-all"
          >
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Open Live Map
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capacity */}
        <section className="lg:col-span-1 space-y-4">
          {capLoading ? (
            <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">Loading capacity…</div>
          ) : (
            <CapacityCard total={capacity.total} occupied={capacity.occupied} />
          )}

          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-peach" />
              <h3 className="font-extrabold text-dark dark:text-cream">Medical Passports</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Each rescued animal gets a generated medical passport with a QR/profile card.
            </p>
          </div>
        </section>

        {/* Incoming queue */}
        <section className="lg:col-span-1 space-y-4">
          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-lavender" />
                <h3 className="font-extrabold text-dark dark:text-cream">Intake Queue</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{queueLoading ? '…' : incomingQueue.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {queueLoading ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">Loading queue…</div>
              ) : incomingQueue.length === 0 ? (
                <EmptyState title="No rescued animals awaiting intake" subtitle="When a mission reaches “rescued”, it becomes available in this queue." />
              ) : (
                incomingQueue.slice(0, 10).map((r) => (
                  <div key={r._id} className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{r.animalType} • rescued</div>
                        <div className="mt-1 text-xs font-extrabold text-dark dark:text-cream truncate">{r.title}</div>
                        <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{r.address || 'Address unknown'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-lavender">P:{r.priorityScore ?? 0}</div>
                        <div className="mt-2">
                          <button
                            onClick={() => handleIntake(r._id)}
                            className="px-3 py-2 rounded-xl bg-lavender text-white text-[10px] font-extrabold hover:bg-lavender-light transition-all"
                          >
                            Intake
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/rescue/${r._id}`)}
                        className="flex-1 px-3 py-2 rounded-xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-[10px] font-bold hover:bg-lavender/10 transition-all"
                      >
                        Open Case
                      </button>
                      <button
                        onClick={() => navigate('/dashboard/shelter')}
                        className="px-3 py-2 rounded-xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-[10px] font-bold hover:bg-lavender/10 transition-all"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right: Adoption + passports previews */}
        <section className="lg:col-span-1 space-y-4">
          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-peach" />
                <h3 className="font-extrabold text-dark dark:text-cream">Adoption Listings</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{adoptionsLoading ? '…' : adoptions.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {adoptionsLoading ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">Loading adoptions…</div>
              ) : adoptions.length === 0 ? (
                <EmptyState title="No adoptable pets" subtitle="Once intake completes, pets appear here when marked available." />
              ) : (
                adoptions.slice(0, 6).map((p) => (
                  <div key={p._id} className="rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 p-3">
                    <div className="text-xs font-extrabold text-dark dark:text-cream">{p.name || p.title || 'Pet'}</div>
                    <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{p.animalType} • {p.breed || 'Mixed Breed'}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lavender" />
                <h3 className="font-extrabold text-dark dark:text-cream">Medical Passport Cards</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{passportsLoading ? '…' : passports.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {passportsLoading ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">Loading passports…</div>
              ) : passports.length === 0 ? (
                <EmptyState title="No passport cards yet" subtitle="Complete intake to generate medical passports." />
              ) : (
                passports.slice(0, 3).map((passport) => (
                  <MedicalPassportCard key={passport._id || passport.medicalPassportId} passport={passport} />
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-peach" />
              <h3 className="font-extrabold text-dark dark:text-cream">Foster Queue</h3>
            </div>
            {fosters?.length ? (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">{fosters.length} foster requests ready.</div>
            ) : (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">No foster requests yet. (Backend demo returns empty.)</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

