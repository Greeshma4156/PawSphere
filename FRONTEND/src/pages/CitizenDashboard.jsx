import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRescues, reportRescue } from '../services/rescueService';
import { getCampaigns } from '../services/donationService';
import { useUIStore } from '../store/uiStore';
import { Compass, Sparkles, Send, Camera, MapPin, HeartHandshake, MessageCircle, ShieldAlert } from 'lucide-react';
import { getElapsedLabel } from '../lib/geo';
import LiveRescueFeedSection from '../components/landing/LiveRescueFeedSection';
import { getSocket } from '../services/socketService';
import { SOCKET_EVENTS } from '../shared/socketEvents';


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

  // F) Donation Campaign Preview
  const { data: campaignsResp, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => getCampaigns().then((r) => r.data || r),
  });
  const campaigns = Array.isArray(campaignsResp?.data)
    ? campaignsResp.data
    : Array.isArray(campaignsResp)
      ? campaignsResp
      : [];

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
      title: 'Donate',
      subtitle: 'Support treatment & triage',
      icon: <HeartHandshake className="w-5 h-5" />,
      onClick: () => navigate('/donations'),
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

      {/* Active Tracking + Nearby Feed + Donations */}
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
                          {r.animalType} • {String(r.status).replace(/_/g, ' ')}
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

          <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-peach" />
                <h3 className="font-extrabold text-dark dark:text-cream">Donation Campaign Preview</h3>
              </div>
              <a href="/donations" className="text-xs font-extrabold text-lavender hover:underline">View all</a>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaignsLoading ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">Loading campaigns…</div>
              ) : (
                campaigns.slice(0, 6).map((c) => (
                  <Link
                    key={c._id}
                    to="/donations"
                    className="p-4 rounded-2xl border border-lavender/10 bg-beige/20 dark:bg-white/5 hover:border-lavender/30 transition-all"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{c.isCompleted ? 'Completed' : 'Active'}</div>
                    <div className="mt-2 font-extrabold text-xs text-dark dark:text-cream line-clamp-1">{c.title}</div>
                    <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">Raised ${c.raisedAmount ?? 0} / ${c.targetAmount ?? 0}</div>
                  </Link>
                ))
              )}
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
          {/* Use existing diagnostics preview component (Phase 4+); will be wired to real API in backend phase. */}
          <div className="text-xs text-gray-500 dark:text-gray-400">AI diagnostics require a backend endpoint in this repo; UI is present but will be wired once available.</div>
        </div>
      </div>
    </div>
  );
}

