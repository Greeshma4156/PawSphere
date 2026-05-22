import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportRescue } from '../../services/rescueService';
import { Compass, Sparkles, Send, MapPin, AlertTriangle } from 'lucide-react';

export default function RescueForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    animalType: 'dog',
    injurySeverity: 'medium',
    description: '',
    coordinates: [77.5946, 12.9716], // Default Bengaluru center [lng, lat]
    address: '',
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorStatus, setErrorStatus] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationPick = (lat, lng) => {
    if (!isNaN(lat) && !isNaN(lng)) {
      setFormData((prev) => ({ ...prev, coordinates: [lng, lat] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorStatus(false);

    try {
      await reportRescue(formData);
      setStatusMessage('Rescue reported successfully! Alerts broadcasted to nearby volunteers.');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      } else {
        setTimeout(() => navigate('/map'), 1500);
      }
    } catch (err) {
      setErrorStatus(true);
      setStatusMessage(err.response?.data?.error || 'Failed to submit rescue report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6 shadow-xl max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <span className="text-[10px] font-extrabold tracking-widest text-lavender bg-lavender/10 px-3 py-1 rounded-full uppercase inline-block">
          Emergency Dispatch
        </span>
        <h3 className="font-extrabold font-outfit text-2xl text-dark dark:text-cream mt-2 flex items-center justify-center gap-1.5">
          🐾 Report a Stray Emergency
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Provide key information. Our system will calculate priority scoring and alert active volunteer rescuers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {statusMessage && (
          <div className={`p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold ${
            errorStatus 
              ? 'bg-red-500/10 text-red-500 border border-red-500/25' 
              : 'bg-mint text-emerald-800 border border-emerald-100'
          }`}>
            {errorStatus ? <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" /> : <Sparkles className="w-4.5 h-4.5 flex-shrink-0" />}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
              Short Description / Title
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Limping indie pup near market"
              className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                Animal Category
              </label>
              <select
                name="animalType"
                className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                value={formData.animalType}
                onChange={handleChange}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                Injury Severity
              </label>
              <select
                name="injurySeverity"
                className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                value={formData.injurySeverity}
                onChange={handleChange}
              >
                <option value="critical">🚨 Critical</option>
                <option value="high">⚠️ High</option>
                <option value="medium">⚡ Medium</option>
                <option value="low">🌱 Low</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            Detailed Description of Condition
          </label>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="e.g. The dog has a cut on its hind right leg. Bleeding has stopped but it is unable to walk. Needs immediate medical wrap."
            className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            Address / Landmark Description
          </label>
          <input
            name="address"
            type="text"
            required
            placeholder="e.g. Cubbon Park Entrance Gate 2, near food truck"
            className="w-full px-3.5 py-2.5 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* Custom coordinates selection block */}
        <div className="bg-beige/10 dark:bg-white/5 p-4 border border-lavender/10 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-lavender" /> Location Coordinates
            </span>
            <span className="text-[9px] text-gray-400">(Vetted for Bengaluru area map)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 mb-0.5">Latitude</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border border-lavender/15 dark:border-white/10 rounded-xl bg-white dark:bg-dark text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                value={formData.coordinates[1]}
                onChange={(e) => handleLocationPick(parseFloat(e.target.value), formData.coordinates[0])}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 mb-0.5">Longitude</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border border-lavender/15 dark:border-white/10 rounded-xl bg-white dark:bg-dark text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                value={formData.coordinates[0]}
                onChange={(e) => handleLocationPick(formData.coordinates[1], parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-lavender text-white font-bold rounded-full text-xs hover:bg-lavender-light hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Dispatching Rescuers...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" /> Broadcast Rescue Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}
