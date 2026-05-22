import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, Heart, Trophy, Users } from 'lucide-react'
import { fadeIn, slideInLeft, slideInRight } from '../../animations/presets'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden px-6 py-12">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-lavender/25 rounded-full filter blur-3xl animate-float-slow -z-10"></div>
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-mint/30 rounded-full filter blur-3xl animate-float-reverse -z-10"></div>
      <div className="absolute top-10 right-1/3 w-60 h-60 bg-peach/30 rounded-full filter blur-3xl animate-pulse-glow -z-10"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Column */}
        <motion.div 
          className="lg:col-span-7 space-y-6 text-left"
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lavender/10 border border-lavender/20 rounded-full text-xs font-bold text-lavender font-outfit uppercase tracking-wider">
            🐾 Reimagining Stray Welfare
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-outfit tracking-tight leading-[1.1] text-dark dark:text-cream">
            Smart Coordination For <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender to-peach">
              Urban Stray Rescue
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl font-normal leading-relaxed">
            Connect strays in danger with active community volunteers, secure immediate medical sponsorship, and digitize shelter intake with next-generation smart passports.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/signup"
              className="bg-lavender text-white px-8 py-3.5 rounded-full font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all shadow-lg shadow-lavender/20"
            >
              Join the Sphere
            </Link>
            <button
              onClick={() => {
                const element = document.getElementById('rescue-feed');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="glass dark:glass-dark text-dark dark:text-cream px-8 py-3.5 rounded-full font-bold font-outfit hover:bg-lavender/15 transition-all"
            >
              Explore Active Feed
            </button>
          </div>

          {/* Floating Rescue Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-lavender/10 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-mint/50 rounded-2xl text-dark">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold font-outfit dark:text-cream text-dark">450+</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Rescues</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-lavender/20 rounded-2xl text-lavender">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold font-outfit dark:text-cream text-dark">1.2k</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Volunteers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-peach/40 rounded-2xl text-dark">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold font-outfit dark:text-cream text-dark">98%</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Success Rate</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side Column */}
        <motion.div 
          className="lg:col-span-5 relative"
          variants={slideInRight}
          initial="initial"
          animate="animate"
        >
          {/* Asymmetrical Frame Overlay */}
          <div className="relative w-full aspect-[4/3] sm:aspect-square bg-gradient-to-tr from-lavender/25 to-peach/25 rounded-[3rem] p-4 overflow-hidden border border-white/40 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"
              alt="Rescued puppy being cared for"
              className="w-full h-full object-cover rounded-[2.5rem] filter contrast-[1.02]"
            />
            
            {/* Live activity ticker overlay */}
            <div className="absolute bottom-6 left-6 right-6 glass p-3.5 rounded-2xl flex items-center gap-3 border border-white/60 shadow-lg">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-medium text-dark select-none leading-normal">
                <span className="font-bold text-lavender">Rescuer John</span> claimed a reported puppy case 2 mins ago
              </p>
            </div>
          </div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute -top-6 -left-6 bg-white dark:bg-dark p-3.5 rounded-2xl border border-lavender/20 shadow-xl flex items-center gap-3 hidden sm:flex"
            whileHover={{ y: -5 }}
          >
            <div className="w-9 h-9 rounded-full bg-peach/20 flex items-center justify-center text-lg">❤️</div>
            <div className="text-left">
              <h5 className="text-xs font-bold font-outfit text-dark dark:text-cream leading-tight">Emergency Fund</h5>
              <p className="text-[10px] font-semibold text-lavender leading-tight">$320 raised of $500</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
