import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, Heart, MapPin } from 'lucide-react';
import { getSocket } from '../../services/socketService';
import { getRescues } from '../../services/rescueService';
import { SOCKET_EVENTS } from '../../shared/socketEvents';



const fallbackFeed = [

  {
    _id: 'case_id_1',
    title: 'Injured Puppy in Central Market',
    animalType: 'dog',
    injurySeverity: 'high',
    address: 'Central Market Vendor Alley 4, Bengaluru',
    status: 'pending',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80'],
    assignedVolunteer: null,
    createdAt: Date.now() - 2 * 60 * 1000,
    priorityScore: 8,
  },
  {
    _id: 'case_id_2',
    title: 'Dehydrated Cat in Park',
    animalType: 'cat',
    injurySeverity: 'medium',
    address: 'Cubbon Park, Near Fountain Gate, Bengaluru',
    status: 'assigned',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80'],
    assignedVolunteer: { name: 'John Doe' },
    createdAt: Date.now() - 68 * 60 * 1000,
    priorityScore: 5,
  },
];

function severityBadge(sev) {
  if (sev === 'critical') return { cls: 'bg-red-500 text-white', label: 'Critical' };
  if (sev === 'high') return { cls: 'bg-orange-500 text-white', label: 'High' };
  if (sev === 'medium') return { cls: 'bg-amber-400 text-dark', label: 'Medium' };
  return { cls: 'bg-mint text-emerald-800', label: 'Low' };
}

function formatElapsed(ts) {
  const delta = Math.max(0, Date.now() - ts);
  const mins = Math.floor(delta / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function normalizeRescue(r) {
  return {
    _id: r._id || r.id,
    title: r.title,
    animalType: r.animalType,
    injurySeverity: r.injurySeverity,
    address: r.address,
    status: r.status,
    photos: r.photos && r.photos.length ? r.photos : [],
    assignedVolunteer: r.assignedVolunteer || null,
    createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
    priorityScore: r.priorityScore ?? 0,
  };
}

export default function LiveRescueFeedSection() {
  const [feed, setFeed] = useState(fallbackFeed);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch real rescues from DB on mount
  useEffect(() => {
    getRescues({ limit: 12 })
      .then((res) => {
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.rescues)
          ? res.rescues
          : null;
        if (items && items.length > 0) {
          setFeed(items.map(normalizeRescue));
        }
      })
      .catch(() => {
        // fallback data stays
      })
      .finally(() => setLoading(false));
  }, []);

  // Socket: prepend newly created rescues in real time
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onRescueCreated = (payload) => {
      const rescue = payload?.rescue || payload;
      if (!rescue?._id) return;
      setFeed((prev) => {
        const exists = prev.some((x) => x._id === rescue._id);
        const next = normalizeRescue(rescue);
        if (exists) return prev.map((x) => (x._id === next._id ? next : x));
        return [next, ...prev].slice(0, 12);
      });
    };

    socket.on(SOCKET_EVENTS.CONNECTION, onConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    socket.on(SOCKET_EVENTS.RESCUE_CREATED, onRescueCreated);

    // Set initial connected state
    if (socket.connected) setConnected(true);

    return () => {
      socket.off(SOCKET_EVENTS.CONNECTION, onConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      socket.off(SOCKET_EVENTS.RESCUE_CREATED, onRescueCreated);
      // NOTE: do NOT call socket.disconnect() here — socket is a shared singleton
    };
  }, []);


  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Live Rescue Feed</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Realtime incidents, severity badges, assigned volunteer, and time elapsed.
          </p>
        </div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
          Socket: <span className={connected ? 'text-emerald-600' : 'text-gray-400'}>{connected ? 'Connected' : 'Mock mode'}</span>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth no-scrollbar">
        {feed.map((item) => {
          const sev = severityBadge(item.injurySeverity);
          const photo = item.photos?.[0];
          return (
            <motion.div
              key={item._id}
              className="flex-shrink-0 w-80 bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-4 snap-start shadow-sm hover:shadow-lg transition-shadow group"
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              whileHover={{ y: -6 }}
            >
              <Link to={`/rescue/${item._id}`}>
                <div className="w-full h-40 rounded-[1.5rem] overflow-hidden relative">
                  <img
                    src={photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${sev.cls}`}>
                    {sev.label}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{item.animalType}</span>
                    <span className="text-[10px] font-extrabold text-lavender">P:{item.priorityScore}</span>
                  </div>
                  <div className="mt-2 font-extrabold text-dark dark:text-cream text-sm line-clamp-1">{item.title}</div>

                  <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-lavender" /> {item.address}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-peach" />
                      <span>{item.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="font-extrabold text-lavender">{formatElapsed(item.createdAt)}</div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-gray-400">Volunteer</div>
                    <div className="text-xs font-extrabold text-dark dark:text-cream">
                      {item.assignedVolunteer?.name || 'Unassigned'}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Open incident</span>
                    <span className="w-8 h-8 rounded-2xl bg-lavender/10 border border-lavender/20 text-lavender flex items-center justify-center group-hover:bg-lavender group-hover:text-white transition-all">
                      <Compass className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <a href="/map" className="px-8 py-3.5 rounded-full bg-lavender text-white text-xs font-extrabold hover:bg-lavender-light shadow-lg shadow-lavender/20 transition-all inline-flex items-center justify-center gap-2">
          Open Full Rescue Map
        </a>
      </div>
    </section>
  );
}

