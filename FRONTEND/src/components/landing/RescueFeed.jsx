import React from 'react'
import { ArrowRight, AlertCircle, Award, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { cardHover } from '../../animations/presets'

// Mock local items if server query isn't resolved yet
const mockFeed = [
  {
    _id: 'case_id_1',
    title: 'Injured Puppy in Central Market',
    animalType: 'dog',
    injurySeverity: 'high',
    address: 'Bengaluru Central Vendor Alley 4',
    status: 'pending',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80'],
  },
  {
    _id: 'case_id_2',
    title: 'Dehydrated Cat in Park',
    animalType: 'cat',
    injurySeverity: 'medium',
    address: 'Cubbon Park, Near Fountain Gate',
    status: 'assigned',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80'],
  },
  {
    _id: 'case_id_3',
    title: 'Bird with Fractured Wing',
    animalType: 'bird',
    injurySeverity: 'low',
    address: '80 Feet Road, Near Coffee Day',
    status: 'rescued',
    photos: ['https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=300&q=80'],
  }
];

export default function RescueFeed() {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-mint text-emerald-800 border-emerald-100';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-500 text-white';
      case 'assigned': return 'bg-lavender text-white';
      case 'on_the_way': return 'bg-peach text-dark';
      case 'rescued': return 'bg-mint text-dark';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div id="rescue-feed" className="py-12 bg-beige/50 dark:bg-dark/40 border-y border-lavender/10 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Title Block */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-outfit text-dark dark:text-cream">Live Rescue Feed</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time alerts of reported strays needing coordination</p>
          </div>
          <button 
            onClick={() => window.location.href = '/map'}
            className="flex items-center gap-1.5 text-sm font-bold text-lavender hover:text-lavender-light transition-colors cursor-pointer"
          >
            Open Rescue Hub <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar">
          {mockFeed.map((item) => (
            <motion.div
              key={item._id}
              className="flex-shrink-0 w-80 bg-white dark:bg-dark border border-lavender/10 dark:border-white/5 rounded-3xl p-4 snap-start relative flex flex-col group cursor-pointer"
              variants={cardHover}
              whileHover="whileHover"
              onClick={() => window.location.href = `/map?case=${item._id}`}
            >
              {/* Picture Frame */}
              <div className="w-full h-40 rounded-2xl overflow-hidden relative">
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Status Float */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </div>
              </div>

              {/* Text Fields */}
              <div className="mt-4 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.animalType}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${getSeverityColor(item.injurySeverity)}`}>
                      {item.injurySeverity} severity
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-dark dark:text-cream leading-snug line-clamp-1 group-hover:text-lavender transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {item.address}</p>
                </div>
                
                {/* Action button */}
                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Click to track case</span>
                  <div className="w-7 h-7 bg-lavender/10 text-lavender rounded-full flex items-center justify-center group-hover:bg-lavender group-hover:text-white transition-all">
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
