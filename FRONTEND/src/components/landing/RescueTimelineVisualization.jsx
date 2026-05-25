import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const steps = [
  { key: 'reported', label: 'Reported' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'on_the_way', label: 'On The Way' },
  { key: 'rescued', label: 'Rescued' },
  { key: 'treatment', label: 'Treatment' },
  { key: 'sheltered', label: 'Shelter' },
  { key: 'safe', label: 'Safe' },
];

export default function RescueTimelineVisualization() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Rescue Timeline Visualization</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Animated workflow cards with glowing connectors.</p>
      </div>

      <div className="relative">
        {/* Desktop connector background */}
        <div className="hidden md:block absolute top-[46px] left-[90px] right-[90px] h-[2px] bg-gradient-to-r from-lavender/30 via-mint/30 to-peach/30" />

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {steps.map((s, idx) => (
            <motion.div
              key={s.key}
              className="relative"
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.06, duration: 0.5 }}
            >
              <div className="rounded-[2rem] border border-lavender/15 bg-white/65 dark:bg-dark/60 backdrop-blur-md p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">Step {idx + 1}</span>
                  <span
                    className="w-3 h-3 rounded-full bg-lavender animate-pulse"
                    style={{ animationDelay: `${idx * 0.15}s` }}
                  />
                </div>
                <div className="mt-3 font-extrabold text-dark dark:text-cream text-sm text-center">{s.label}</div>
                <div className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-lavender/70 to-mint/70" />
              </div>

              {/* Connector chevron for mobile */}
              {idx < steps.length - 1 && (
                <div className="md:hidden absolute left-1/2 -bottom-7 -translate-x-1/2">
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="px-8 py-3.5 rounded-full bg-lavender text-white font-extrabold text-xs hover:bg-lavender-light shadow-lg shadow-lavender/20 transition-all"
            onClick={() => {
              const el = document.getElementById('timeline-cta');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Full Operations
          </button>
        </div>
      </div>

      <div id="timeline-cta" className="sr-only" aria-hidden="true" />
    </section>
  );
}

