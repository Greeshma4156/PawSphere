import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { Activity, Users, ShieldCheck, HeartHandshake, Timer } from 'lucide-react';

function AnimatedCounter({ value = 0, suffix = '', label, icon }) {
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 100, damping: 20 });

  // useTransform is the correct framer-motion API for mapping a MotionValue
  // (spring.to() is react-spring syntax and does not exist here)
  const display = useTransform(spring, (latest) => `${Math.round(latest)}${suffix}`);

  React.useEffect(() => {
    animate(raw, value, { duration: 1.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, raw]);

  return (
    <motion.div
      className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6 shadow-sm"
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">{label}</div>
          <motion.div className="mt-3 text-2xl font-extrabold font-outfit text-lavender">
            <motion.span>{display}</motion.span>
          </motion.div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsImpactWall() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Analytics / Impact Wall</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Floating animated counters for real-time operations metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCounter value={124} label="Animals rescued" suffix="+" icon={<Activity className="w-5 h-5" />} />
        <AnimatedCounter value={38} label="Active volunteers" suffix="+" icon={<Users className="w-5 h-5" />} />
        <AnimatedCounter value={18400} label="Donations raised" suffix="$" icon={<HeartHandshake className="w-5 h-5" />} />
        <AnimatedCounter value={14} label="Shelters connected" suffix="" icon={<ShieldCheck className="w-5 h-5" />} />
      </div>

      <div className="mt-6 max-w-3xl mx-auto">
        <AnimatedCounter value={9} label="Avg response time" suffix=" min" icon={<Timer className="w-5 h-5" />} />
      </div>
    </section>
  );
}
