import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, ShieldCheck, UserCheck } from 'lucide-react';

const tickerMock = [
  { id: 1, text: 'Volunteer Alex accepted a rescue', icon: <UserCheck className="w-4 h-4" />, tone: 'lavender' },
  { id: 2, text: 'Medical campaign funded: Bruno surgery', icon: <Heart className="w-4 h-4" />, tone: 'peach' },
  { id: 3, text: 'Animal safely transferred to shelter partner', icon: <ShieldCheck className="w-4 h-4" />, tone: 'mint' },
  { id: 4, text: 'Clinic partner confirmed availability for treatment', icon: <Zap className="w-4 h-4" />, tone: 'lavender' },
];

export default function RealtimeActivityTicker() {
  const content = [...tickerMock, ...tickerMock];

  const toneColor = (tone) => {
    if (tone === 'peach') return 'text-peach';
    if (tone === 'mint') return 'text-mint';
    return 'text-lavender';
  };

  return (
    <section className="py-10 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-extrabold font-outfit text-dark dark:text-cream">Realtime Activity Ticker</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Smooth scrolling operational updates.</p>
      </div>

      <div className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-lavender/10">
          <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
            Live operations stream (mock)
          </div>
        </div>

        <div className="relative">
          <motion.div
            className="flex gap-6 px-6 py-4 w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
          >
            {content.map((evt, idx) => (
              <div
                key={`${evt.id}-${idx}`}
                className="flex items-center gap-3 bg-beige/20 border border-lavender/10 rounded-2xl px-4 py-3 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-2xl bg-white/60 border border-lavender/15 flex items-center justify-center ${toneColor(evt.tone)}`}>
                  {evt.icon}
                </div>
                <div className="text-[11px] font-extrabold text-dark dark:text-cream whitespace-nowrap">
                  {evt.text}
                </div>
              </div>
            ))}
          </motion.div>

          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/80 to-transparent dark:from-dark/80 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/80 to-transparent dark:from-dark/80 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

