import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, BadgeCheck, Heart, Sparkles, AlertCircle, Coins, HeartHandshake, Milestone } from 'lucide-react'
import { fadeIn, slideInLeft, slideInRight } from '../../animations/presets'

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden px-6 py-16 md:py-24 bg-gradient-to-b from-cream via-cream to-beige/30 dark:from-dark dark:via-dark dark:to-dark/95">
      {/* Premium Artistic Blur Background Blobs */}
      <div className="absolute top-1/4 left-5 w-[350px] h-[350px] bg-gradient-to-tr from-lavender/30 to-lilac/10 rounded-full filter blur-3xl animate-float-slow -z-10"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-gradient-to-tr from-peach/30 to-mint/20 rounded-full filter blur-3xl animate-float-reverse -z-10"></div>
      <div className="absolute top-10 right-1/4 w-[280px] h-[280px] bg-gradient-to-tr from-lavender/20 to-mint/20 rounded-full filter blur-3xl animate-pulse -z-10"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Emotional Storytelling & CTA */}
        <motion.div 
          className="lg:col-span-7 space-y-8 text-left"
          variants={slideInLeft}
          initial="initial"
          animate="animate"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lavender/15 to-peach/15 border border-lavender/25 rounded-full text-xs font-bold text-lavender font-outfit uppercase tracking-wider shadow-sm">
            🐾 Because Every Stray Deserves a Healing Hand
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-outfit tracking-tight leading-[1.08] text-dark dark:text-cream">
            Healing & Protecting <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender via-peach to-lavender animate-pulse-glow">
              Our Silent Companions
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl font-normal leading-relaxed">
            PawSphere is the first transparent crowdfunding & rapid-response stray rescue startup. Connect injured street animals directly with local veterinarians, claim rescues, and track medical recovery via blockchain-grade verifiable passports.
          </p>

          {/* Core Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/donations"
              className="bg-lavender text-white px-8 py-4 rounded-full font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all shadow-xl shadow-lavender/25 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Coins className="w-4 h-4" /> Start / Sponsor Campaign
            </Link>
            <Link
              to="/donations"
              className="bg-white dark:bg-white/5 border border-lavender/20 hover:border-lavender text-dark dark:text-cream px-8 py-4 rounded-full font-bold font-outfit hover:bg-lavender/5 transition-all flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
            >
              Explore Campaigns
            </Link>
            <Link
              to="/adoptions"
              className="bg-peach text-dark px-8 py-4 rounded-full font-bold font-outfit hover:bg-peach/80 transition-all flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-peach/15"
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Rescue & Adopt
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 pt-4 items-center border-t border-lavender/10 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure 256-bit Donations
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <BadgeCheck className="w-4 h-4 text-lavender" /> 100% Verified Campaigns
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <HeartHandshake className="w-4 h-4 text-peach" /> Trusted by 12,000+ Animal Lovers
            </div>
          </div>
        </motion.div>

        {/* Right Side: Visual Hero Graphic & Interactive Overlays */}
        <motion.div 
          className="lg:col-span-5 relative flex items-center justify-center"
          variants={slideInRight}
          initial="initial"
          animate="animate"
        >
          {/* Asymmetrical Frame Overlay */}
          <div className="relative w-full max-w-[460px] aspect-square bg-gradient-to-tr from-lavender/30 via-peach/20 to-mint/20 rounded-[3.5rem] p-4 overflow-hidden border border-white/50 dark:border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
              alt="Rescued puppy being cared for"
              className="w-full h-full object-cover rounded-[3rem] filter contrast-[1.03]"
            />
            
            {/* Live activity ticker overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-dark/95 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 border border-lavender/15 dark:border-white/10 shadow-lg">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-medium text-dark dark:text-cream select-none leading-normal">
                <span className="font-bold text-lavender">Rescuer Sarah</span> claimed case <span className="font-bold">#4910</span> (Injured Kitten) 1 min ago
              </p>
            </div>
          </div>

          {/* Floating Widget 1: Emergency Fund */}
          <motion.div
            className="absolute top-8 -left-6 bg-white/95 dark:bg-dark/95 backdrop-blur-md p-4 rounded-2xl border border-lavender/25 shadow-xl flex items-center gap-3 hidden sm:flex"
            whileHover={{ y: -6, scale: 1.03 }}
          >
            <div className="w-10 h-10 rounded-full bg-peach/20 flex items-center justify-center text-lg animate-pulse">🏥</div>
            <div className="text-left">
              <h5 className="text-xs font-bold font-outfit text-dark dark:text-cream leading-tight">Bruno’s Vet Surgery</h5>
              <p className="text-[10px] font-semibold text-lavender leading-tight">$820 raised of $1,000</p>
              <div className="w-24 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-lavender w-[82%]"></div>
              </div>
            </div>
          </motion.div>

          {/* Floating Widget 2: Recovery Badge */}
          <motion.div
            className="absolute bottom-28 -right-4 bg-white/95 dark:bg-dark/95 backdrop-blur-md p-3.5 rounded-2xl border border-mint/40 shadow-xl flex items-center gap-3 hidden sm:flex"
            whileHover={{ y: -6, scale: 1.03 }}
          >
            <div className="w-9 h-9 rounded-full bg-mint flex items-center justify-center text-base">🎉</div>
            <div className="text-left">
              <h5 className="text-xs font-bold font-outfit text-dark dark:text-cream leading-tight">Adopted Today!</h5>
              <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Lucy the beagle</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Animated Statistics Bar */}
      <div className="absolute bottom-0 left-0 right-0 py-6 bg-white/30 dark:bg-dark/20 backdrop-blur-md border-t border-lavender/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-1">
            <h4 className="text-2xl md:text-3xl font-extrabold font-outfit text-dark dark:text-cream tracking-tight">4,820+</h4>
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Pets Saved</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl md:text-3xl font-extrabold font-outfit text-lavender tracking-tight">$128,450</h4>
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Funds Raised</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl md:text-3xl font-extrabold font-outfit text-peach tracking-tight">24 Active</h4>
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Verified NGOs</p>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <h4 className="text-2xl md:text-3xl font-extrabold font-outfit text-emerald-500 tracking-tight">1,890+</h4>
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Treatments Completed</p>
          </div>
          <div className="space-y-1 hidden md:block">
            <h4 className="text-2xl md:text-3xl font-extrabold font-outfit text-dark dark:text-cream tracking-tight">1,240</h4>
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Active Volunteers</p>
          </div>
        </div>
      </div>
    </section>
  )
}
