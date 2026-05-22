import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Radio, MapPin, ClipboardList, CheckCircle } from 'lucide-react'
import { staggerContainer, fadeIn } from '../../animations/presets'

const timelineSteps = [
  {
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    title: 'Emergency Spotting',
    desc: 'Citizen reports a stray dog or cat in danger, uploading injury descriptions and coordinates.',
    bgColor: 'bg-red-500/10'
  },
  {
    icon: <Radio className="w-5 h-5 text-lavender" />,
    title: 'Radius Smart Dispatch',
    desc: 'Priority engine scores the severity and pings matching volunteers within a 10km radius.',
    bgColor: 'bg-lavender/10'
  },
  {
    icon: <MapPin className="w-5 h-5 text-peach" />,
    title: 'Claim & Navigation',
    desc: 'Volunteer accepts the mission, chats with the reporter, and navigates via live map routes.',
    bgColor: 'bg-peach/10'
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-mint text-emerald-800" />,
    title: 'Clinic Treatment & Passport',
    desc: 'Animal is stabilized, veterinary bills are crowdsourced, and a digital passport is issued.',
    bgColor: 'bg-mint'
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    title: 'Foster & Adoption',
    desc: 'Animal completes rehabilitation and is matched with a loving foster or permanent home.',
    bgColor: 'bg-emerald-50'
  }
];

export default function TimelineEngine() {
  return (
    <section className="py-16 px-6 bg-beige/30 dark:bg-dark/20 border-y border-lavender/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">
            The Rescue Lifecycle
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            See how PawSphere coordinates strays from danger to safety in real time.
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-8 relative"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Connector Line on Desktop */}
          <div className="hidden md:block absolute top-[25px] left-10 right-10 h-[1.5px] bg-gradient-to-r from-red-500/20 via-lavender/40 to-emerald-500/20 -z-10"></div>

          {timelineSteps.map((step, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center text-center px-4"
              variants={fadeIn}
            >
              {/* Icon Orb */}
              <div className={`w-12 h-12 rounded-full ${step.bgColor} border border-lavender/10 flex items-center justify-center shadow-md mb-4 relative bg-white dark:bg-dark`}>
                {step.icon}
                {/* Step number badge */}
                <span className="absolute -top-1 -right-1 bg-dark text-white dark:bg-white dark:text-dark text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>

              <h3 className="font-bold font-outfit text-sm text-dark dark:text-cream mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
