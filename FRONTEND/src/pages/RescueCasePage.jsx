import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { ShieldAlert, Users, MessageCircle, Heart, Sparkles, Pin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useUIStore } from '../store/uiStore'
import { getRescueDetails } from '../services/rescueService'
import { getSocket } from '../services/socketService'
import { SOCKET_EVENTS } from '../shared/socketEvents'

// Fix leaflet icons for Vite builds
// (Keeping local workaround to avoid touching global map code yet.)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function SkeletonBlock({ className }) {
  return <div className={`bg-white/60 dark:bg-white/5 rounded-2xl animate-pulse ${className}`} />
}

function severityToInsight(severity) {
  switch (severity) {
    case 'critical':
      return {
        label: 'Critical escalation',
        message:
          'Prioritize rapid assignment. Expect higher risk of deterioration without immediate treatment.'
      }
    case 'high':
      return {
        label: 'High priority',
        message:
          'Dispatch nearest available volunteer and prepare treatment/triage checklist.'
      }
    case 'medium':
      return {
        label: 'Moderate urgency',
        message:
          'Monitor progression and dispatch with standard emergency protocol.'
      }
    default:
      return {
        label: 'Low urgency',
        message:
          'Recommend safe handling and scheduled assessment.'
      }
  }
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
};

const getDisplayStatus = (status) => {
  return DISPLAY_STATUS[status] || String(status || '').replace(/_/g, ' ');
};

export default function RescueCasePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUIStore()

  const [chatDraft, setChatDraft] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const chatEndRef = useRef(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rescue_details', id],
    queryFn: () => getRescueDetails(id).then(r => r.data),
    enabled: Boolean(id),
  })

  const timeline = data?.timeline ?? []
  const rescue = data?.data ?? data // compatibility with API response shape
  
  // Sync historical messages if loaded
  useEffect(() => {
    if (data?.messages) {
      setChatMessages(data.messages.map(m => ({
        text: m.message,
        sender: m.senderName,
        senderId: m.senderId,
        role: m.senderRole,
        timestamp: m.createdAt,
      })))
    }
  }, [data?.messages])
  const details = useMemo(() => {
    const obj = rescue?.location?.coordinates ? rescue : rescue
    const coords = obj?.location?.coordinates
    const [lng, lat] = coords || []
    return { coordsLatLng: coords ? [lat, lng] : null }
  }, [rescue])

  const insight = severityToInsight(rescue?.injurySeverity)

  const assignedVolunteer = rescue?.assignedVolunteer

  const assignedVolunteerPanel = (
    <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-lavender" />
          <h3 className="font-extrabold text-dark dark:text-cream">Assigned Volunteer</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {getDisplayStatus(rescue?.status) || '—'}
        </span>
      </div>

      <div className="mt-4">
        {assignedVolunteer ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-dark dark:text-cream">
                  {assignedVolunteer.name || 'Volunteer'}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Phone: {assignedVolunteer.phone || '—'}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-lavender/10 border border-lavender/25 text-[10px] font-bold text-lavender">
                {assignedVolunteer.availability ? 'Available' : 'Assigned'}
              </span>
            </div>

            <div className="mt-3">
              <button
                onClick={() => navigate(`/dashboard/volunteer`)}
                className="w-full py-2.5 rounded-2xl bg-lavender text-white text-xs font-extrabold hover:bg-lavender-light transition-all"
              >
                Open Volunteer Console
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            No volunteer assigned yet. Keep monitoring timeline for assignment events.
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
          <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Real-time updates are active. This workspace syncs via Socket.io rooms.
          </div>
        </div>
      </div>
    </div>
  )

  // Socket.io realtime invalidation & room coordination + live chat
  useEffect(() => {
    if (!id) return
    const socket = getSocket()
    if (!socket) return

    // Join room for this specific rescue case
    socket.emit(SOCKET_EVENTS.JOIN_RESCUE, id)

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['rescue_details', id] })
    }

    const handleChatMessage = (msg) => {
      setChatMessages((prev) => [...prev, msg])
      // Auto-scroll to bottom after state update
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    socket.on(SOCKET_EVENTS.RESCUE_CLAIMED, handleUpdate)
    socket.on(SOCKET_EVENTS.RESCUE_UPDATED, handleUpdate)
    socket.on(SOCKET_EVENTS.RESCUE_STATUS_UPDATED, handleUpdate)
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, handleChatMessage)

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_RESCUE, id)
      socket.off(SOCKET_EVENTS.RESCUE_CLAIMED, handleUpdate)
      socket.off(SOCKET_EVENTS.RESCUE_UPDATED, handleUpdate)
      socket.off(SOCKET_EVENTS.RESCUE_STATUS_UPDATED, handleUpdate)
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, handleChatMessage)
    }
  }, [id, queryClient])

  const handleSendChat = (e) => {
    e.preventDefault()
    const trimmed = chatDraft.trim()
    if (!trimmed) return
    const socket = getSocket()
    if (socket) {
      socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
        rescueId: id,
        text: trimmed,
        sender: user?.name || user?.email || 'Anonymous',
        senderId: user?._id || user?.id || null,
        role: user?.role || 'citizen',
        timestamp: new Date().toISOString(),
      })
    }
    // Optimistically append own message
    setChatMessages((prev) => [
      ...prev,
      {
        text: trimmed,
        sender: user?.name || user?.email || 'You',
        senderId: user?._id || user?.id || 'self',
        role: user?.role || 'citizen',
        timestamp: new Date().toISOString(),
        _local: true,
      },
    ])
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    setChatDraft('')
  }

  return (

    <div className="max-w-7xl mx-auto px-6 py-6">

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20">
            <Sparkles className="w-4 h-4 text-lavender" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender">
              Rescue Control Center
            </span>
          </div>
          <h1 className="mt-3 font-extrabold font-outfit text-2xl md:text-3xl text-dark dark:text-cream">
            {isLoading ? 'Loading case…' : rescue?.title || 'Unknown Rescue'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Case ID: <span className="font-mono">{id}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2.5 rounded-2xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-xs font-bold hover:bg-lavender/10 transition-all"
          >
            View on Map
          </button>

        </div>
      </div>

      {isError ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 text-xs text-red-500">
          Unable to load this rescue case.
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map Preview + Metadata */}
        <section className="lg:col-span-1 space-y-4">
          {isLoading ? (
            <>
              <SkeletonBlock className="h-56" />
              <SkeletonBlock className="h-28" />
            </>
          ) : (
            <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-lavender" />
                  <h3 className="font-extrabold text-dark dark:text-cream">Map Preview</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {getDisplayStatus(rescue?.status) || '—'}
                </span>
              </div>

              <div className="h-56 w-full">
                {details.coordsLatLng ? (
                  <MapContainer
                    center={details.coordsLatLng}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={details.coordsLatLng}>
                      <Popup>
                        <div className="text-xs">
                          <div className="font-bold">{rescue?.title}</div>
                          <div className="text-gray-500">{rescue?.address || 'Address unknown'}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Coordinates missing
                  </div>
                )}
              </div>

              <div className="p-5 space-y-2 border-t border-lavender/15">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Severity</span>
                  <span className="font-bold text-lavender">{rescue?.injurySeverity}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Priority</span>
                  <span className="font-bold text-lavender">{rescue?.priorityScore ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Animal</span>
                  <span className="font-bold text-dark dark:text-cream">{rescue?.animalType}</span>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <SkeletonBlock className="h-40" />
          ) : (
            <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lavender" />
                <h3 className="font-extrabold text-dark dark:text-cream">AI Severity Insights</h3>
              </div>
              <div className="mt-3">
                <div className="text-xs font-extrabold text-lavender">{insight.label}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                  {insight.message}
                </div>
              </div>
            </div>
          )}

          {isLoading ? null : (
            <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-peach" />
                <h3 className="font-extrabold text-dark dark:text-cream">Activity Feed</h3>
              </div>
              <div className="mt-3 space-y-2">
                {(timeline || []).slice(-6).reverse().map((evt) => (
                  <div key={evt._id || evt.createdAt} className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    <span className="font-bold text-dark dark:text-cream">{evt.eventType}:</span>{' '}
                    {evt.description}
                    <div className="text-[10px] text-gray-400 mt-1">
                      {evt.author} • {evt.createdAt ? new Date(evt.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                ))}
                {(!timeline || timeline.length === 0) && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">No timeline events yet.</div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Middle: Timeline + assigned panel */}
        <section className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <SkeletonBlock className="h-72" />
          ) : (
            <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-lavender" />
                    <h3 className="font-extrabold text-dark dark:text-cream">Rescue Status Timeline</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Live
                  </span>
              </div>

              <div className="mt-4 space-y-3">
                {(timeline || []).map((evt, idx) => (
                  <div key={evt._id || idx} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-lavender mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs font-extrabold text-dark dark:text-cream">
                          {evt.eventType}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {evt.createdAt ? new Date(evt.createdAt).toLocaleString() : ''}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                        {evt.description}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">Author: {evt.author}</div>
                    </div>
                  </div>
                ))}

                {(!timeline || timeline.length === 0) && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">No timeline events.</div>
                )}
              </div>
            </div>
          )}

          {assignedVolunteerPanel}

          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-lavender" />
                <h3 className="font-extrabold text-dark dark:text-cream">Live Chat</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Socket Live
              </span>
            </div>

            <div className="mt-4">
              {/* Message list */}
              <div className="h-52 overflow-y-auto rounded-2xl bg-beige/20 dark:bg-white/5 p-4 border border-lavender/10 flex flex-col gap-2.5">
                {chatMessages.length === 0 && (
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-6">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {chatMessages.map((msg, idx) => {
                  const isOwn = msg._local || msg.senderId === (user?._id || user?.id)
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        isOwn ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                          isOwn
                            ? 'bg-lavender text-white'
                            : 'bg-white/80 dark:bg-white/10 text-dark dark:text-cream border border-lavender/15'
                        }`}
                      >
                        <div className="text-[11px] leading-relaxed">{msg.text}</div>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5 px-1">
                        {msg.sender} · {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Send form */}
              <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                <input
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder="Type a message to your assigned volunteer…"
                  className="flex-1 px-4 py-3 rounded-2xl bg-beige/20 dark:bg-white/5 border border-lavender/10 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                />
                <button
                  type="submit"
                  disabled={!chatDraft.trim()}
                  className="px-4 py-3 rounded-2xl bg-lavender text-white text-xs font-extrabold hover:bg-lavender-light transition-all disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>


        </section>
      </div>
    </div>
  )
}

