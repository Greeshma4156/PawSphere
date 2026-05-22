import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUIStore } from '../store/uiStore';
import { getRescues, upvoteRescue } from '../services/rescueService';
import { ShieldAlert, Compass, Heart, Radio, MapPin, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

// Swap leaflet markers default icon urls so they load correctly inside Vite production builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to refocus the map when selection changes
function MapRefocus({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function RescueMap() {
  const { user } = useUIStore();
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default to Bengaluru center

  // Filter states
  const [filters, setFilters] = useState({
    animalType: 'all',
    severity: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadRescues();
  }, [filters]);

  const loadRescues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.animalType !== 'all') params.animalType = filters.animalType;
      if (filters.status !== 'all') params.status = filters.status;
      const res = await getRescues(params);
      
      let list = res.data || [];
      if (filters.severity !== 'all') {
        list = list.filter(item => item.injurySeverity === filters.severity);
      }
      setRescues(list);

      // If there's a URL query parameter for a specific case, select it
      const urlParams = new URLSearchParams(window.location.search);
      const caseId = urlParams.get('case');
      if (caseId && list.length > 0) {
        const found = list.find(c => c._id === caseId);
        if (found) {
          handleSelectCase(found);
        }
      }
    } catch (err) {
      console.error('Failed to load rescues on map:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = (item) => {
    setSelectedCase(item);
    if (item.location?.coordinates) {
      // Swapping coordinates for Leaflet (expects [lat, lng])
      const [lng, lat] = item.location.coordinates;
      setMapCenter([lat, lng]);
    }
  };

  const handleUpvote = async (id) => {
    if (!user) {
      alert('Please log in to upvote/verify cases.');
      return;
    }
    try {
      const res = await upvoteRescue(id);
      if (res.success) {
        // Update local list state
        setRescues(prev => prev.map(c => c._id === id ? { ...c, upvotes: res.data.upvotes, priorityScore: res.data.priorityScore } : c));
        if (selectedCase && selectedCase._id === id) {
          setSelectedCase(prev => ({ ...prev, upvotes: res.data.upvotes, priorityScore: res.data.priorityScore }));
        }
      }
    } catch (err) {
      console.error('Upvote failure:', err);
    }
  };

  // Create custom colored icons based on severity
  const getMarkerIcon = (severity) => {
    let color = '#B79CFF'; // lavender
    if (severity === 'critical') color = '#EF4444'; // red
    if (severity === 'high') color = '#F97316'; // orange
    if (severity === 'medium') color = '#F59E0B'; // amber

    const svgHtml = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: ${color}20;
        border: 2.5px solid ${color};
        border-radius: 50%;
        box-shadow: 0 4px 12px ${color}40;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: ${color};
          border-radius: 50%;
        "></div>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-amber-400 text-dark';
      default: return 'bg-mint text-emerald-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
      
      {/* Sidebar Filter Panel & Feed List */}
      <div className="w-full lg:w-96 flex flex-col gap-4 h-full">
        
        {/* Filters */}
        <div className="bg-white dark:bg-dark p-4 rounded-3xl border border-lavender/10 dark:border-white/5 flex flex-col gap-3">
          <h3 className="font-bold text-lg font-outfit text-dark dark:text-cream">Filters</h3>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Animal</label>
              <select
                className="w-full p-2 bg-beige/30 dark:bg-white/5 border border-lavender/10 rounded-xl"
                value={filters.animalType}
                onChange={(e) => setFilters(prev => ({ ...prev, animalType: e.target.value }))}
              >
                <option value="all">All</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Severity</label>
              <select
                className="w-full p-2 bg-beige/30 dark:bg-white/5 border border-lavender/10 rounded-xl"
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Status</label>
              <select
                className="w-full p-2 bg-beige/30 dark:bg-white/5 border border-lavender/10 rounded-xl"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="rescued">Rescued</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rescue Feed list inside Sidebar */}
        <div className="flex-grow bg-white dark:bg-dark p-4 rounded-3xl border border-lavender/10 dark:border-white/5 overflow-y-auto flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-dark dark:text-cream">Active Incidents ({rescues.length})</h4>
            {loading && <span className="text-xs text-lavender animate-pulse">Updating...</span>}
          </div>

          <div className="flex flex-col gap-2">
            {rescues.map((item) => (
              <div
                key={item._id}
                onClick={() => handleSelectCase(item)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  selectedCase?._id === item._id
                    ? 'bg-lavender/10 border-lavender'
                    : 'bg-beige/20 dark:bg-white/5 border-lavender/5 hover:border-lavender/20'
                }`}
              >
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.animalType} • {item.status}</span>
                  <h5 className="font-bold text-xs text-dark dark:text-cream truncate leading-snug">{item.title}</h5>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">📍 {item.address || 'Address unknown'}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${getSeverityBadge(item.injurySeverity)}`}>
                    {item.injurySeverity}
                  </span>
                  <span className="text-[9px] font-bold text-lavender">P:{item.priorityScore}</span>
                </div>
              </div>
            ))}

            {!loading && rescues.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-xs">
                No active rescue reports match current filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Map Box + Overlay Details */}
      <div className="flex-grow relative h-full rounded-3xl overflow-hidden border border-lavender/10 dark:border-white/5 shadow-inner">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapRefocus center={mapCenter} />

          {rescues.map((item) => {
            if (!item.location?.coordinates) return null;
            const [lng, lat] = item.location.coordinates;
            return (
              <Marker
                key={item._id}
                position={[lat, lng]}
                icon={getMarkerIcon(item.injurySeverity)}
                eventHandlers={{
                  click: () => handleSelectCase(item),
                }}
              >
                <Popup>
                  <div className="text-xs max-w-xs font-sans">
                    <span className="text-[9px] font-bold uppercase text-gray-400">{item.animalType}</span>
                    <h4 className="font-bold text-sm mt-0.5 text-dark">{item.title}</h4>
                    <p className="text-gray-500 mt-1">{item.address}</p>
                    <button
                      onClick={() => handleSelectCase(item)}
                      className="mt-2 w-full bg-lavender text-white py-1.5 rounded-lg text-center font-bold text-[10px] hover:bg-lavender-light transition-all flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Incident
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Selected Incident Drawer Overlay */}
        {selectedCase && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 z-[1000] bg-white/90 dark:bg-dark/95 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest bg-lavender/10 text-lavender px-2 py-0.5 rounded-md inline-block mb-1.5 capitalize">
                  {selectedCase.status} • {selectedCase.animalType}
                </span>
                <h3 className="font-extrabold font-outfit text-base text-dark dark:text-cream leading-tight">
                  {selectedCase.title}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">📍 {selectedCase.address}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-7 h-7 rounded-full bg-beige/30 dark:bg-white/5 flex items-center justify-center text-xs hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
              {selectedCase.description}
            </p>

            <div className="flex items-center justify-between border-y border-lavender/10 dark:border-white/5 py-2.5 text-xs">
              <span className="font-medium text-gray-400">Priority Score:</span>
              <span className="font-bold text-lavender bg-lavender/10 px-2 py-0.5 rounded-full text-[10px]">
                {selectedCase.priorityScore} PTS
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleUpvote(selectedCase._id)}
                className={`flex-grow py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  user && selectedCase.upvotes?.includes(user._id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-lavender text-white hover:bg-lavender-light'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                {user && selectedCase.upvotes?.includes(user._id) ? 'Downvote (Unverify)' : 'Upvote (Verify)'}
              </button>
              
              <button
                onClick={() => window.location.href = `/dashboard/citizen?track=${selectedCase._id}`}
                className="bg-beige/40 dark:bg-white/5 border border-lavender/15 hover:bg-lavender/10 text-dark dark:text-cream px-4 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                Track <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
