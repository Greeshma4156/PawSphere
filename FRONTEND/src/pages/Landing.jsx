import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, Heart, Trophy, Users, ArrowRight } from 'lucide-react'
import Hero from '../components/landing/Hero'
import RescueFeed from '../components/landing/RescueFeed'
import BentoFeatures from '../components/landing/BentoFeatures'
import TimelineEngine from '../components/landing/TimelineEngine'
import ImpactWall from '../components/landing/ImpactWall'

export default function Landing() {
  return (
    <div className="flex flex-col relative w-full overflow-hidden">
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Floating Rescue Feed Ticker */}
      <RescueFeed />

      {/* 3. Bento Features Grid */}
      <BentoFeatures />

      {/* 4. Rescue Story Timeline Engine */}
      <TimelineEngine />

      {/* 5. Impact Wall */}
      <ImpactWall />

      {/* 6. Curved Gradient CTA Panel */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="bg-gradient-to-tr from-lavender/80 to-peach/85 rounded-[3rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden text-white flex flex-col items-center">
          {/* Animated decorative orbs */}
          <div className="absolute top-1/2 left-10 w-44 h-44 bg-white/20 rounded-full blur-2xl animate-float"></div>
          <div className="absolute top-10 right-20 w-32 h-32 bg-white/25 rounded-full blur-2xl animate-float-reverse"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-4 py-1.5 rounded-full inline-block mb-4">
              Join Our Network
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-outfit leading-tight mb-4">
              Help Keep Urban Stray Animals Safe
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
              Become a citizen reporter, claim cases as a volunteer, or sponsor clinics in need of funding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-lavender px-8 py-3.5 rounded-full font-bold font-outfit hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/map"
                className="bg-dark/15 border border-white/40 hover:bg-dark/25 px-8 py-3.5 rounded-full font-bold font-outfit flex items-center justify-center gap-1.5 transition-all text-white"
              >
                View Live Map <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding details */}
      <footer className="py-8 text-center text-xs text-gray-400 border-t border-lavender/5 dark:border-white/5">
        <p>© 2026 PawSphere Ecosystem. Funded Pet Welfare Startup Simulator. Made with ❤️ for stray welfare.</p>
      </footer>

    </div>
  )
}
