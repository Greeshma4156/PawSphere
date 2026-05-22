import React from 'react'
import { motion } from 'framer-motion'
import { cardHover } from '../../animations/presets'

const mockStories = [
  {
    id: 1,
    title: 'Max Recovery',
    tags: ['rehabilitated', 'adopted'],
    beforeImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&h=150',
    afterImg: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=400&q=80',
    description: 'Found with high dehydration. Now living in a home in Colorado.',
    author: 'Sarah C.'
  },
  {
    id: 2,
    title: 'Cleo the Cat',
    tags: ['rescued', 'sponsored'],
    beforeImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150',
    afterImg: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80',
    description: 'Fractured paw fully fixed by community-funded surgery campaign.',
    author: 'Vol John'
  },
  {
    id: 3,
    title: 'Whiskers Sparrow',
    tags: ['safe', 'released'],
    beforeImg: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=150&h=150',
    afterImg: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=400&q=80',
    description: 'Pigeon with wing trauma rehabilitated and released back to the park.',
    author: 'NGO Hope'
  }
];

export default function ImpactWall() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">
          Community Impact Wall
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real stories of survival and coordination achieved through PawSphere.
        </p>
      </div>

      {/* Masonry-Style Columns */}
      <div className="columns-1 md:columns-3 gap-6 space-y-6">
        {mockStories.map((story) => (
          <motion.div
            key={story.id}
            className="break-inside-avoid bg-white dark:bg-dark border border-lavender/10 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col relative"
            variants={cardHover}
            whileHover="whileHover"
          >
            {/* Story Main Image */}
            <div className="w-full h-52 rounded-2xl overflow-hidden mb-4 relative">
              <img
                src={story.afterImg}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Tags */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {story.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-mint text-emerald-800 border border-emerald-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Before / After Thumbnail Comparison bubble */}
            <div className="flex items-center gap-3 bg-beige/50 dark:bg-white/5 p-2 rounded-2xl border border-lavender/10 mb-3">
              <img
                src={story.beforeImg}
                alt="Before rescue condition"
                className="w-10 h-10 rounded-xl object-cover filter saturate-50 brightness-95"
              />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Before spotting</p>
                <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mt-0.5 leading-tight">Dehydrated & Limping</p>
              </div>
            </div>

            <h3 className="font-bold font-outfit text-base text-dark dark:text-cream leading-snug">
              {story.title}
            </h3>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              "{story.description}"
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-bold text-gray-400">
              <span>Reported by {story.author}</span>
              <span className="text-lavender">PAWSPHERE RESOLVED</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
