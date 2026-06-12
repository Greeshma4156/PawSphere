import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRescues, reportRescue } from '../services/rescueService';
import { useUIStore } from '../store/uiStore';
import {
  Compass,
  Sparkles,
  Send,
  Camera,
  MapPin,
  HeartHandshake,
  MessageCircle,
  ShieldAlert,
  Shield,
  ClipboardList,
  Syringe,
  Heart,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { getElapsedLabel } from '../lib/geo';
import LiveRescueFeedSection from '../components/landing/LiveRescueFeedSection';
import { getSocket, useSocketEvents } from '../services/socketService';
import { SOCKET_EVENTS } from '../shared/socketEvents';
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
} from '../services/shelterService';

import CapacityCard from '../components/shelter/CapacityCard';
import MedicalPassportCard from '../components/shelter/MedicalPassportCard';
import EmptyState from '../components/common/EmptyState';

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

// ── Medical Log and Vaccination Forms ──────────────────────────────────────

function MedicalLogForm({ petId, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [treatment, setTreatment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;
    setLoading(true);
    try {
      await addMedicalLog(petId, { notes: notes.trim(), treatment: treatment.trim() });
      setNotes('');
      setTreatment('');
      onSuccess?.();
    } catch { /* swallow */ } finally { setLoading(false); }
  };

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
  );
}

function VaccinationForm({ petId, onSuccess }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    setLoading(true);
    try {
      await addVaccination(petId, { name: name.trim(), date, status: 'completed' });
      setName('');
      setDate('');
      onSuccess?.();
    } catch { /* swallow */ } finally { setLoading(false); }
  };

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
  );
}

function QuickCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-5 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{subtitle}</div>
          <div className="mt-2 font-extrabold text-dark dark:text-cream">{title}</div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center">
          {icon}
        </div>
      </div>
    </button>
  );
}

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUIStore();

  const [activeDashboardTab, setActiveDashboardTab] = useState('emergency'); // 'emergency' | 'shelter'
  const [expandedPassport, setExpandedPassport] = useState(null);
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'vaccine' for passport updates

  // ── Shelter Console Queries ──────────────────────────────────────────────
  const { data: capResp, isLoading: capLoading } = useQuery({
    queryKey: ['shelter_capacity'],
    queryFn: () => getShelterCapacity().then((r) => r.data || r),
    enabled: activeDashboardTab === 'shelter',
  });
  const capacity = capResp || {};

  const { data: queueResp, isLoading: queueLoading } = useQuery({
    queryKey: ['shelter_incoming_queue'],
    queryFn: () => getIncomingRescueQueue().then((r) => r.data || r),
    enabled: activeDashboardTab === 'shelter',
  });
  const incomingQueue = Array.isArray(queueResp?.data) ? queueResp.data : Array.isArray(queueResp) ? queueResp : [];

  const { data: passportsResp, isLoading: passportsLoading } = useQuery({
    queryKey: ['shelter_medical_passports'],
    queryFn: () => getMedicalPassports().then((r) => r.data || r),
    enabled: activeDashboardTab === 'shelter',
  });
  const passports = Array.isArray(passportsResp?.data) ? passportsResp.data : Array.isArray(passportsResp) ? passportsResp : [];

  const { data: fostersResp, isLoading: fostersLoading } = useQuery({
    queryKey: ['shelter_foster_requests'],
    queryFn: () => getFosterRequests().then((r) => r.data || r),
    enabled: activeDashboardTab === 'shelter',
  });
  const fosters = Array.isArray(fostersResp?.data) ? fostersResp.data : Array.isArray(fostersResp) ? fostersResp : [];

  // ── Shelter Mutations ────────────────────────────────────────────────────
  const invalidateShelter = () => {
    queryClient.invalidateQueries({ queryKey: ['shelter_capacity'] });
    queryClient.invalidateQueries({ queryKey: ['shelter_incoming_queue'] });
    queryClient.invalidateQueries({ queryKey: ['shelter_medical_passports'] });
  };

  const handleIntake = async (rescueId) => {
    if (!rescueId) return;
    try {
      await intakeRescue(rescueId);
      invalidateShelter();
    } catch { /* error handled by axios interceptor */ }
  };

  const fosterMutation = useMutation({
    mutationFn: ({ fosterId, action }) =>
      action === 'approve' ? approveFoster(fosterId) : rejectFoster(fosterId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shelter_foster_requests'] }),
  });

  useSocketEvents({
    enabled: activeDashboardTab === 'shelter',
    eventNames: [SOCKET_EVENTS.RESCUE_CLAIMED, SOCKET_EVENTS.RESCUE_UPDATED, SOCKET_EVENTS.RESCUE_STATUS_UPDATED],
    onEvent: () => invalidateShelter(),
  });

  const statusColors = {
    pending: 'text-amber-500',
    approved: 'text-emerald-500',
    rejected: 'text-red-500',
  };

  // A) Emergency Rescue Panel (wrapper to extend existing RescueForm)
  // We will reuse reportRescue directly so we can support photos + GPS here.
  const [gpsBusy, setGpsBusy] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [form, setForm] = useState({
    title: '',
    animalType: 'dog',
    injurySeverity: 'medium',
    description: '',
    coordinates: [77.5946, 12.9716],
    address: '',
  });
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);
  const [submitErr, setSubmitErr] = useState(false);

  const handleAutoGPS = async () => {
    setGpsBusy(true);
    setSubmitErr(false);
    setSubmitMsg(null);
    try {
      if (!navigator.geolocation) throw new Error('Geolocation not supported');
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      const { latitude, longitude } = pos.coords;
      setForm((prev) => ({ ...prev, coordinates: [longitude, latitude] }));
      setSubmitMsg('GPS coordinates captured successfully.');
    } catch (e) {
      setSubmitErr(true);
      setSubmitMsg(e?.message || 'Failed to detect GPS');
    } finally {
      setGpsBusy(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedPhotos(files);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmitRescue = async (e) => {
    e.preventDefault();
    setSubmitBusy(true);
    setSubmitErr(false);
    setSubmitMsg(null);

    try {
      let photos = [];
      if (selectedPhotos.length) {
        photos = await Promise.all(selectedPhotos.map((f) => toBase64(f)));
      }

      const payload = {
        ...form,
        coordinates: form.coordinates,
        photos,
      };

      const res = await reportRescue(payload);
      const created = res?.data?.rescue?._id || res?.data?.rescue?.id || res?.data?.rescueCase?._id;

      await queryClient.invalidateQueries({ queryKey: ['rescues'] });

      if (!created) throw new Error('Rescue created but ID missing from response');
      navigate(`/rescue/${created}`);
    } catch (err) {
      setSubmitErr(true);
      setSubmitMsg(err.response?.data?.error || err.message || 'Failed to create rescue');
    } finally {
      setSubmitBusy(false);
    }
  };

  // B) Active Rescue Tracking
  const { data: rescuesResp, isLoading: rescuesLoading } = useQuery({
    queryKey: ['rescues'],
    queryFn: () => getRescues({}),
  });

  const myRescues = useMemo(() => {
    const all = Array.isArray(rescuesResp?.data)
      ? rescuesResp.data
      : Array.isArray(rescuesResp)
        ? rescuesResp
        : [];
    if (!user?._id) return all;
    return all.filter((r) => String(r.reporter?._id || r.reporter) === String(user._id) || String(r.reporter) === String(user._id));
  }, [rescuesResp, user]);

  // Sync with sockets
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
    };

    socket.on(SOCKET_EVENTS.RESCUE_CREATED, handleUpdate);
    socket.on(SOCKET_EVENTS.RESCUE_UPDATED, handleUpdate);
    socket.on(SOCKET_EVENTS.RESCUE_STATUS_UPDATED, handleUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.RESCUE_CREATED, handleUpdate);
      socket.off(SOCKET_EVENTS.RESCUE_UPDATED, handleUpdate);
      socket.off(SOCKET_EVENTS.RESCUE_STATUS_UPDATED, handleUpdate);
    };
  }, [queryClient]);


  const quickActions = [
    {
      title: 'Open Rescue Map',
      subtitle: 'Live feed + incidents',
      icon: <Compass className="w-5 h-5" />,
      onClick: () => navigate('/map'),
    },
    {
      title: 'Create Emergency',
      subtitle: 'Report stray in seconds',
      icon: <Send className="w-5 h-5" />,
      onClick: () => document.getElementById('emergency-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    },

    {
      title: 'Chat Support',
      subtitle: 'Open your case workspace',
      icon: <MessageCircle className="w-5 h-5" />,
      onClick: () => {
        if (myRescues?.[0]?._id) navigate(`/rescue/${myRescues[0]._id}`);
        else navigate('/map');
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Premium Mode Switcher ── */}
      <div className="flex gap-3 p-1.5 bg-white/40 dark:bg-dark/40 backdrop-blur-md border border-lavender/10 dark:border-white/5 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveDashboardTab('emergency')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeDashboardTab === 'emergency'
              ? 'bg-lavender text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-lavender dark:hover:text-cream'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Incident Triage
        </button>
        <button
          type="button"
          onClick={() => setActiveDashboardTab('shelter')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeDashboardTab === 'shelter'
              ? 'bg-lavender text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-lavender dark:hover:text-cream'
          }`}
        >
          <Shield className="w-4 h-4" /> Shelter Console
        </button>
      </div>

      {activeDashboardTab === 'emergency' ? (
        <div className="space-y-8">
          <div id="emergency-panel" className="rounded-[2rem] bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20">
                  <ShieldAlert className="w-4 h-4 text-lavender" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender">Emergency Rescue Panel</span>
                </div>
                <h2 className="mt-3 font-extrabold font-outfit text-2xl md:text-3xl text-dark dark:text-cream">Report a Stray Emergency</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload an image, capture GPS, select severity, and broadcast to nearby volunteers.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitRescue} className="mt-6 space-y-4">
              {submitMsg && (
                <div
                  className={`p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold ${
                    submitErr ? 'bg-red-500/10 text-red-500 border border-red-500/25' : 'bg-mint text-emerald-800 border border-emerald-100'
                  }`}
                >
                  {submitErr ? <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" /> : <Sparkles className="w-4.5 h-4.5 flex-shrink-0" />}
                  <span>{submitMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Title</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                    placeholder="e.g. Limping indie pup near market"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Animal Type</label>
                  <select
                    value={form.animalType}
                    onChange={(e) => setForm((p) => ({ ...p, animalType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Severity</label>
                  <select
                    value={form.injurySeverity}
                    onChange={(e) => setForm((p) => ({ ...p, injurySeverity: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                  >
                    <option value="critical">🚨 Critical</option>
                    <option value="high">⚠️ High</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="low">🌱 Low</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                    placeholder="Describe injuries, bleeding, mobility, and urgency"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Address / Landmark</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                  placeholder="e.g. Cubbon Park Entrance Gate 2, near food truck"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-beige/10 dark:bg-white/5 p-4 border border-lavender/10 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-lavender" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GPS Coordinates</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoGPS}
                        disabled={gpsBusy}
                        className="px-3 py-1.5 rounded-full bg-lavender text-white text-[10px] font-extrabold hover:bg-lavender-light transition-all disabled:opacity-50"
                      >
                        {gpsBusy ? 'Detecting GPS…' : 'Auto-detect'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 mb-0.5">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={form.coordinates[1]}
                          onChange={(e) => setForm((p) => ({ ...p, coordinates: [p.coordinates[0], parseFloat(e.target.value)] }))}
                          className="w-full px-3 py-2 border border-lavender/15 dark:border-white/10 rounded-xl bg-white dark:bg-dark text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 mb-0.5">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={form.coordinates[0]}
                          onChange={(e) => setForm((p) => ({ ...p, coordinates: [parseFloat(e.target.value), p.coordinates[1]] }))}
                          className="w-full px-3 py-2 border border-lavender/15 dark:border-white/10 rounded-xl bg-white dark:bg-dark text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-beige/10 dark:bg-white/5 p-4 border border-lavender/10 rounded-3xl space-y-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Camera className="w-4 h-4 text-lavender" /> Upload Animal Image
                    </label>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="text-xs" />
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{selectedPhotos.length ? `${selectedPhotos.length} image(s) ready` : 'Optional'} </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitBusy}
                className="w-full py-3 bg-lavender text-white font-bold rounded-full text-xs hover:bg-lavender-light hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {submitBusy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Dispatching Rescuers…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Broadcast Rescue Report
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-extrabold font-outfit text-lg text-dark dark:text-cream">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {quickActions.map((a) => (
                <QuickCard key={a.title} icon={a.icon} title={a.title} subtitle={a.subtitle} onClick={a.onClick} />
              ))}
            </div>
          </div>

          {/* Active Tracking + Nearby Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-1 space-y-4">
              <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-lavender" />
                    <h3 className="font-extrabold text-dark dark:text-cream">Active Rescue Tracking</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{rescuesLoading ? 'Loading…' : myRescues.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {rescuesLoading ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Loading rescues…</div>
                  ) : myRescues.length === 0 ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">No rescues reported yet.</div>
                  ) : (
                    myRescues.slice(0, 6).map((r) => (
                      <Link
                        key={r._id}
                        to={`/rescue/${r._id}`}
                        className="block p-3 rounded-2xl border border-lavender/10 hover:border-lavender/30 bg-beige/20 dark:bg-white/5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                              {r.animalType} • {getDisplayStatus(r.status)}
                            </div>
                            <div className="mt-1 font-extrabold text-xs text-dark dark:text-cream line-clamp-1">{r.title}</div>
                            <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{getElapsedLabel(r.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-lavender">Priority {r.priorityScore ?? 0}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">{r.assignedVolunteer?.name || 'Unassigned'}</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="lg:col-span-2 space-y-4">
              <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-lavender" />
                    <h3 className="font-extrabold text-dark dark:text-cream">Nearby Emergency Feed</h3>
                  </div>
                  <a href="/map" className="text-xs font-extrabold text-lavender hover:underline">Open full map</a>
                </div>
                <div className="mt-4">
                  <LiveRescueFeedSection />
                </div>
              </div>


            </section>
          </div>

          {/* AI Diagnostics Widget (existing component is mock; backend pending) */}
          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lavender" />
              <h3 className="font-extrabold text-dark dark:text-cream">AI Diagnostics Widget</h3>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">AI diagnostics require a backend endpoint in this repo; UI is present but will be wired once available.</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
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
                            type="button"
                            onClick={() => handleIntake(r._id)}
                            className="px-3 py-1.5 rounded-xl bg-lavender text-white text-[10px] font-extrabold hover:bg-lavender/80 transition-all cursor-pointer"
                          >
                            Intake ↗
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/rescue/${r._id}`)}
                            className="px-3 py-1.5 rounded-xl bg-beige/40 dark:bg-white/5 border border-lavender/15 text-dark dark:text-cream text-[10px] font-bold hover:bg-lavender/10 transition-all cursor-pointer"
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
                  const isExpanded = expandedPassport === passport._id;
                  return (
                    <div key={passport._id || passport.medicalPassportId} className="rounded-2xl bg-beige/10 dark:bg-white/5 border border-lavender/10 overflow-hidden">
                      <MedicalPassportCard passport={passport} />

                      {/* Expand toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedPassport(isExpanded ? null : passport._id);
                          setActiveTab('log');
                        }}
                        className="w-full flex items-center justify-center gap-1 py-2 border-t border-lavender/10 text-[10px] font-bold text-lavender hover:bg-lavender/5 transition-all cursor-pointer"
                      >
                        {isExpanded ? <><ChevronUp className="w-3 h-3" /> Hide Update Panel</> : <><ChevronDown className="w-3 h-3" /> Update Passport</>}
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-lavender/10 bg-beige/20 dark:bg-white/3">
                          {/* Tab switcher */}
                          <div className="flex gap-2 mb-2">
                            <button
                              type="button"
                              onClick={() => setActiveTab('log')}
                              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${activeTab === 'log' ? 'bg-lavender text-white' : 'bg-beige/40 dark:bg-white/5 text-gray-500'}`}
                            >
                              <Heart className="w-3 h-3" /> Health Log
                            </button>
                            <button
                              type="button"
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
                  );
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
                          type="button"
                          onClick={() => fosterMutation.mutate({ fosterId: f._id, action: 'approve' })}
                          disabled={fosterMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-extrabold hover:bg-emerald-600 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => fosterMutation.mutate({ fosterId: f._id, action: 'reject' })}
                          disabled={fosterMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-500 text-white text-[10px] font-extrabold hover:bg-red-600 disabled:opacity-40 transition-all cursor-pointer"
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
      )}
    </div>
  );
}

