import React from 'react'
import { ShieldAlert, Sparkles, Award, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function BentoFeatures() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold font-outfit text-dark dark:text-cream">
          Features Built For Real Impact
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          A fully integrated rescue ecosystem coordinating responders, shelters, and sponsors.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
        {/* Card 1: Emergency Reporting (Span 2 Cols) */}
        <motion.div
          as={Link}
          to="/map"
          className="md:col-span-2 bg-gradient-to-br from-lavender/30 to-lilac/30 border border-lavender/20 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer"
          whileHover={{ y: -5 }}
        >
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-lavender/10 rounded-full blur-2xl" />

          <div>
            <div className="w-10 h-10 bg-lavender text-white rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-dark dark:text-cream">
              Instant GPS Emergency Dispatch
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-md leading-relaxed">
              Report stray animal cases in seconds. Drop pins directly on our mapping system, upload videos/images, and trigger nearby volunteer broadcasts immediately.
            </p>
          </div>

          <span className="text-xs font-bold text-lavender flex items-center gap-1 mt-4">
            Try Reporting Now →
          </span>
        </motion.div>

        {/* Card 2: AI injury Diagnosis (Span 1 Col) */}
        <motion.div
          as={Link}
          to="/dashboard/citizen?action=report&urgency=critical"
          className="bg-white dark:bg-dark border border-lavender/10 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between relative group cursor-pointer"
          whileHover={{ y: -5 }}
        >
          <div>
            <div className="w-10 h-10 bg-mint text-emerald-800 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-dark dark:text-cream">AI Diagnostics</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Upload photos to precheck severity estimation, flag duplicates, and score urgency prioritize.
            </p>
          </div>

          <div className="bg-mint/20 border border-mint px-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-800 w-max select-none">
            Heuristics Scanner v1.0
          </div>
        </motion.div>

        {/* Card 3: Gamified streaks (Span 1 Col) */}
        <motion.div
          as={Link}
          to="/dashboard/volunteer"
          className="bg-white dark:bg-dark border border-lavender/10 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between relative group cursor-pointer"
          whileHover={{ y: -5 }}
        >
          <div>
            <div className="w-10 h-10 bg-peach/50 text-orange-800 rounded-2xl flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-dark dark:text-cream">Rescuer Gamification</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Earn XP points, maintain response streaks, lock achievement badges, and climb regional leaderboards.
            </p>
          </div>

          <span className="text-xs font-bold text-peach flex items-center gap-0.5">
            View Achievements →
          </span>
        </motion.div>

        {/* Card 4: Medical Sponsorship (Span 2 Cols) */}
        <motion.div
          as={Link}
          to="/donations"
          className="md:col-span-2 bg-gradient-to-br from-peach/30 to-orange-100/30 border border-peach/40 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer"
          whileHover={{ y: -5 }}
        >
          <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-peach/20 rounded-full blur-2xl" />

          <div>
            <div className="w-10 h-10 bg-peach text-orange-800 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-dark dark:text-cream">
              Transparent Medical Campaigns
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-md leading-relaxed">
              Sponsor surgeries and clinic treatments directly. Follow individual pet passports with invoice transparency and progress meter notifications.
            </p>
          </div>

          <span className="text-xs font-bold text-orange-700 flex items-center gap-1 mt-4">
            Browse Campaigns →
          </span>
        </motion.div>
      </div>
    </section>
  )
}

