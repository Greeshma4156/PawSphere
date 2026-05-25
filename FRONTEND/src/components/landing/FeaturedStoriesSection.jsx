import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BadgeCheck, Sparkles } from 'lucide-react';
import { cardHover } from '../../animations/presets';

const stories = [
  {
    id: 'st1',
    title: 'From Fear to Home',
    subtitle: 'Before/After rescue: Bruno’s recovery',
    photo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=700&q=80',
    chips: ['rehabilitated', 'adopted'],
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'st2',
    title: 'Community Surgery Fund',
    subtitle: 'Receipts + transparency milestones',
    photo: 'https://images.unsplash.com/photo-1563911301993-0c9b4c1a1b5b?auto=format&fit=crop&w=700&q=80',
    chips: ['sponsored', 'verified'],
    icon: <BadgeCheck className="w-5 h-5" />
  },
  {
    id: 'st3',
    title: 'Volunteer Spotlight',
    subtitle: 'John Doe—streak badge rescuer',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80',
    chips: ['streak', 'top rescuer'],
    icon: <Sparkles className="w-5 h-5" />
  }
];

export default function FeaturedStoriesSection() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Featured Stories</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Citizen testimonials, volunteer highlights, and adoption wins.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((s) => (
          <motion.div
            key={s.id}
            className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm cursor-pointer"
            variants={cardHover}
            whileHover="whileHover"
          >
            <div className="h-44 w-full relative">
              <img src={s.photo} alt={s.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-white/80 border border-lavender/20 text-lavender flex items-center justify-center">
                {s.icon}
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {s.chips.map((c) => (
                  <span key={c} className="px-3 py-1 rounded-full bg-beige/30 border border-lavender/15 text-[10px] font-extrabold text-dark dark:text-cream">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 font-extrabold text-dark dark:text-cream">{s.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{s.subtitle}</div>
              <div className="mt-5 text-xs font-extrabold text-lavender">Read story →</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

