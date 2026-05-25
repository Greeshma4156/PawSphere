import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Hospital, User } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { getRescues } from '../../services/rescueService';

// Fix leaflet icons for Vite builds
// NOTE: This is local to this component so it doesn't affect the rest of the app.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeGlowIcon(color = '#EF4444') {
  const svgHtml = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:34px;
      height:34px;
      background-color:${color}22;
      border:2.5px solid ${color};
      border-radius:50%;
      box-shadow: 0 0 20px ${color}55;
    ">
      <div style="width:10px;height:10px;background:${color};border-radius:50%;"></div>
    </div>
  `;
  return L.divIcon({ html: svgHtml, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
}

const DEMO_RESCUES = [
  { id: 'r1', label: 'Emergency: Limping pup', coords: [12.973, 77.5806], severity: 'critical', rescueId: null },
  { id: 'r2', label: 'Dehydrated cat', coords: [12.96, 77.596], severity: 'high', rescueId: null },
  { id: 'r3', label: 'Injured bird', coords: [12.934, 77.6101], severity: 'medium', rescueId: null },
];

export default function InteractiveMapPreview() {
  const center = [12.9716, 77.5946]; // Bengaluru
  const [liveRescueMarkers, setLiveRescueMarkers] = useState(DEMO_RESCUES);

  // Fetch real geo-tagged rescues from the DB
  useEffect(() => {
    getRescues({ limit: 20 })
      .then((res) => {
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.rescues)
          ? res.rescues
          : [];

        const geoItems = items
          .filter((r) => r.location?.coordinates?.length === 2)
          .map((r) => {
            const [lng, lat] = r.location.coordinates;
            return {
              id: r._id || r.id,
              label: r.title || 'Rescue',
              coords: [lat, lng],
              severity: r.injurySeverity || 'low',
              rescueId: r._id || r.id,
            };
          });

        if (geoItems.length > 0) setLiveRescueMarkers(geoItems);
      })
      .catch(() => {
        // fallback demo markers stay
      });
  }, []);

  const volunteerMarkers = [
    { id: 'v1', name: 'Alex (Verified)', coords: [12.975, 77.596], availability: true },
    { id: 'v2', name: 'Priya', coords: [12.962, 77.582], availability: false },
  ];

  const shelters = [
    { id: 's1', name: 'Hope Shelter', coords: [12.976, 77.602] },
  ];

  const clinics = [
    { id: 'c1', name: 'Nearby Clinic', coords: [12.957, 77.606] },
  ];

  const severityColor = (severity) => {
    if (severity === 'critical') return '#EF4444';
    if (severity === 'high') return '#F97316';
    if (severity === 'medium') return '#F59E0B';
    return '#A78BFA';
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Interactive Map Preview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Glowing emergency markers, volunteer locations, shelters & clinics.</p>
      </div>

      <div className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="h-[420px] w-full relative">
          <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {shelters.map((s) => (
              <Marker key={s.id} position={s.coords}>
                <Popup>
                  <div className="text-xs">
                    <div className="font-extrabold">{s.name}</div>
                    <div className="text-gray-500">Shelter intake</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {clinics.map((c) => (
              <Marker key={c.id} position={c.coords}>
                <Popup>
                  <div className="text-xs">
                    <div className="font-extrabold">{c.name}</div>
                    <div className="text-gray-500">Treatment partner</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {volunteerMarkers.map((v) => (
              <Marker
                key={v.id}
                position={v.coords}
                icon={makeGlowIcon(v.availability ? '#A78BFA' : '#94A3B8')}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-extrabold">{v.name}</div>
                    <div className="text-gray-500">{v.availability ? 'Available' : 'Assigned'}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {liveRescueMarkers.map((r) => (
              <Marker key={r.id} position={r.coords} icon={makeGlowIcon(severityColor(r.severity))}>
                <Popup>
                  <div className="text-xs">
                    <div className="font-extrabold">{r.label}</div>
                    <div className="text-gray-500">Severity: {r.severity}</div>
                    {r.rescueId && (
                      <a
                        href={`/rescue/${r.rescueId}`}
                        className="mt-1 block text-lavender font-bold hover:underline"
                      >
                        Open case →
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
            <motion.div
              className="pointer-events-auto bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 rounded-2xl p-3 flex items-center gap-2 shadow-sm"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <MapPin className="w-4 h-4 text-lavender" />
              <div className="text-[11px] font-bold text-dark dark:text-cream">
                Emergency markers + dispatch context
              </div>
            </motion.div>

            <motion.div
              className="pointer-events-auto bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 rounded-2xl p-3 flex items-center gap-2 shadow-sm"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <User className="w-4 h-4 text-mint" />
              <div className="text-[11px] font-bold text-dark dark:text-cream">
                Volunteer + shelter + clinic locations
              </div>
              <Hospital className="w-4 h-4 text-peach" />
            </motion.div>
          </div>
        </div>

        <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-lavender/10">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Live Preview</div>
            <div className="text-sm font-extrabold text-dark dark:text-cream mt-1">Mini map for incident awareness</div>
          </div>

          <a
            href="/map"
            className="px-6 py-3 rounded-full bg-lavender text-white text-xs font-extrabold hover:bg-lavender-light transition-all shadow-lg shadow-lavender/20"
          >
            Open Full Rescue Map
          </a>
        </div>
      </div>
    </section>
  );
}

