import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BadgeCheck, DollarSign, ShieldCheck, Sparkles } from 'lucide-react';
import { cardHover } from '../../animations/presets';

const campaignsMock = [
  {
    id: 'c1',
    title: 'Orthopedic surgery for Bruno',
    raised: 320,
    target: 500,
    expenses: [
      { t: 'Bone plates & screws', a: 250 },
      { t: 'Surgeon consultation', a: 150 },
    ],
    percent: 64,
    story: 'Bruno is walking with support today—treatment funded by the community.',
  },
  {
    id: 'c2',
    title: 'Vaccine drive for stray colony',
    raised: 200,
    target: 200,
    expenses: [
      { t: 'Anti-rabies doses', a: 80 },
      { t: 'Multi-vaccine vials', a: 120 },
    ],
    percent: 100,
    story: 'Fully funded—vaccines delivered to a 15-pet stray pack.',
  },
];

function ProgressRing({ percent }) {
  const pct = Math.max(0, Math.min(100, percent));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} stroke="#E5E7EB" strokeWidth="6" fill="none" opacity="0.35" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#FB923C"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-extrabold text-dark dark:text-cream">{pct}%</span>
      </div>
    </div>
  );
}

export default function DonationImpactPreview() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Donation & Impact</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Premium transparency—expenses, progress, and rescued outcomes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {campaignsMock.map((c) => (
            <motion.div
              key={c.id}
              className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6"
              variants={cardHover}
              whileHover="whileHover"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-peach/20 border border-peach/30 text-orange-700 flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Active Campaign</div>
                      <div className="text-lg font-extrabold text-dark dark:text-cream">{c.title}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                    Raised <span className="text-lavender">${c.raised}</span> of <span className="text-gray-900 dark:text-gray-200">${c.target}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {c.expenses.slice(0, 2).map((e) => (
                      <div key={e.t} className="p-3 rounded-2xl border border-lavender/10 bg-beige/20">
                        <div className="text-[11px] font-extrabold text-dark dark:text-cream">{e.t}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">${e.a}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-2xl border border-lavender/10 bg-mint/10 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {c.story}
                  </div>
                </div>

                <div className="shrink-0">
                  <ProgressRing percent={c.percent} />
                </div>
              </div>

              <div className="mt-5 flex gap-3 items-center text-xs">
                <span className="px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20 font-extrabold text-lavender">Transparent expenses</span>
                <span className="px-3 py-1 rounded-full bg-mint/20 border border-mint/30 font-extrabold text-emerald-800 inline-flex items-center gap-2">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified updates
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <motion.div
            className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6"
            variants={cardHover}
            whileHover="whileHover"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-mint/20 border border-mint/30 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Impact Summary</div>
                <div className="text-lg font-extrabold text-dark dark:text-cream">Today’s momentum</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[{ k: 'Donors', v: '1,428' }, { k: 'Rescues supported', v: '76' }, { k: 'Avg. transparency', v: '98%' }, { k: 'Clinics connected', v: '14' }].map((x) => (
                <div key={x.k} className="flex items-center justify-between p-3 rounded-2xl border border-lavender/10 bg-beige/20">
                  <div className="text-[11px] font-extrabold text-gray-500 dark:text-gray-400">{x.k}</div>
                  <div className="text-sm font-extrabold text-lavender">{x.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-2xl border border-lavender/10 bg-beige/20 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 inline mr-2 text-lavender" /> Campaign updates are structured as stages with receipts and milestone notifications.
            </div>
          </motion.div>

          <motion.div
            className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6"
            variants={cardHover}
            whileHover="whileHover"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Quick Checkout</div>
                <div className="text-lg font-extrabold text-dark dark:text-cream">Mock donation</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="w-full py-3 rounded-2xl bg-beige/30 border border-lavender/15 hover:bg-lavender/10 transition-all text-xs font-extrabold text-dark dark:text-cream"
                  onClick={() => {
                    // lightweight demo; no backend call yet
                    alert(`Mock checkout: Donating $${amt} to the selected campaign.`);
                  }}
                >
                  Donate ${amt}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <a
          href="/donations"
          className="px-8 py-3.5 rounded-full bg-lavender text-white font-extrabold text-xs hover:bg-lavender-light shadow-lg shadow-lavender/20 transition-all inline-flex items-center justify-center gap-2"
        >
          Support Medical Cases
        </a>
      </div>
    </section>
  );
}

