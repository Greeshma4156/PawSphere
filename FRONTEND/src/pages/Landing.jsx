import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';

import Hero from '../components/landing/Hero';
import BentoFeatures from '../components/landing/BentoFeatures';
import TimelineEngine from '../components/landing/TimelineEngine';

const LiveRescueFeedSection = lazy(() => import('../components/landing/LiveRescueFeedSection.jsx'));
const InteractiveMapPreview = lazy(() => import('../components/landing/InteractiveMapPreview.jsx'));
const DonationImpactPreview = lazy(() => import('../components/landing/DonationImpactPreview.jsx'));
const ShelterAdoptionPreview = lazy(() => import('../components/landing/ShelterAdoptionPreview.jsx'));
const PremiumFooter = lazy(() => import('../components/landing/PremiumFooter.jsx'));

function Skeleton({ className }) {
  return <div className={`bg-white/60 dark:bg-white/5 rounded-3xl animate-pulse ${className}`} />;
}

export default function Landing() {
  return (
    <div className="flex flex-col relative w-full overflow-hidden">
      <Hero />

      {/* 1. LIVE RESCUE FEED */}
      <div id="live-rescue-feed">
        <Suspense fallback={<Skeleton className="h-[280px] my-6 mx-6" />}>
          <LiveRescueFeedSection />
        </Suspense>
      </div>

      {/* 2. INTERACTIVE MAP PREVIEW */}
      <div id="interactive-map-preview">
        <Suspense fallback={<Skeleton className="h-[520px] my-6 mx-6" />}>
          <InteractiveMapPreview />
        </Suspense>
      </div>

      {/* 3. PREMIUM BENTO FEATURES */}
      <BentoFeatures />

      {/* 4. DONATION & IMPACT */}
      <Suspense fallback={<Skeleton className="h-[420px] my-6 mx-6" />}>
        <DonationImpactPreview />
      </Suspense>

      {/* 5. SHELTER & ADOPTION PREVIEW */}
      <Suspense fallback={<Skeleton className="h-[520px] my-6 mx-6" />}>
        <ShelterAdoptionPreview />
      </Suspense>

      {/* 6. NARRATIVE ENGINE */}
      <TimelineEngine />

      {/* 7. CTA FOOTER */}
      <Suspense fallback={<div className="h-24" />}>
        <PremiumFooter />
      </Suspense>

      {/* END CTA */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="bg-gradient-to-tr from-lavender/80 to-peach/85 rounded-[3rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden text-white flex flex-col items-center">
          <div className="absolute top-1/2 left-10 w-44 h-44 bg-white/20 rounded-full blur-2xl animate-float" />
          <div className="absolute top-10 right-20 w-32 h-32 bg-white/25 rounded-full blur-2xl animate-float-reverse" />

          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-4 py-1.5 rounded-full inline-block mb-4">
              Join Our Network
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-outfit leading-tight mb-4">
              Help Keep Urban Stray Animals Safe
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
              Become a citizen reporter, claim cases as a volunteer, or support medical campaigns.
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
                View Live Map
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

