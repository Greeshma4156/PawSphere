import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Flame, Award, Sparkles } from 'lucide-react';
import { cardHover } from '../../animations/presets';

const leaderboardMock = [
  { id: 1, name: 'Alex R.', points: 1280, streak: 9 },
  { id: 2, name: 'John Doe', points: 920, streak: 5 },
  { id: 3, name: 'Priya S.', points: 760, streak: 3 },
  { id: 4, name: 'Maya K.', points: 640, streak: 2 },
];

function ProgressRing({ value = 0, label, color = 'lavender' }) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const stroke = color === 'mint' ? '#34D399' : color === 'peach' ? '#FB923C' : '#A78BFA';

  return (
    <div className="flex items-center gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
        <circle cx="32" cy="32" r={radius} stroke="#E5E7EB" strokeWidth="6" fill="none" opacity="0.35" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke={stroke}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div>
        <div className="text-xl font-extrabold text-dark dark:text-cream">{pct}%</div>
        <div className="text-[11px] font-bold text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export default function VolunteerGamificationPreview() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Volunteer Gamification</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Streaks, achievements, leaderboard progress—built for real coordination.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          className="lg:col-span-7 bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6"
          variants={cardHover}
          whileHover="whileHover"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Leaderboard</div>
                <div className="text-lg font-extrabold text-dark dark:text-cream">Top rescuers this week</div>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-mint/20 border border-mint/30 text-emerald-800 px-3 py-1 rounded-full">Live mock</span>
          </div>

          <div className="mt-6 space-y-3">
            {leaderboardMock.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-lavender/10 bg-beige/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center font-extrabold text-sm">
                    {v.id}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-dark dark:text-cream">{v.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Streak: {v.streak} days</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-lavender">{v.points} XP</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Rescues boosted</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="lg:col-span-5 space-y-6">
          <motion.div className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6" variants={cardHover} whileHover="whileHover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-peach/20 border border-peach/30 text-orange-700 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Response Streak</div>
                <div className="text-lg font-extrabold text-dark dark:text-cream">Keep the chain alive</div>
              </div>
            </div>
            <div className="mt-5">
              <ProgressRing value={74} label="Streak progress" />
            </div>
          </motion.div>

          <motion.div className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6" variants={cardHover} whileHover="whileHover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-mint/20 border border-mint/30 text-emerald-800 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Achievements</div>
                <div className="text-lg font-extrabold text-dark dark:text-cream">Unlocked badges</div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[{ t: 'First Rescue', d: 'Complete your first dispatch' }, { t: 'Streak 3', d: '3-day consecutive response' }, { t: 'Verified Rescuer', d: 'Get verified by shelter admins' }].map((b) => (
                <div key={b.t} className="flex items-start gap-3 p-3 rounded-2xl border border-lavender/10 bg-beige/20">
                  <div className="w-9 h-9 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-dark dark:text-cream">{b.t}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{b.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <a
          href="/dashboard/volunteer"
          className="px-8 py-3.5 rounded-full bg-lavender text-white font-extrabold text-xs hover:bg-lavender-light shadow-lg shadow-lavender/20 transition-all inline-flex items-center justify-center gap-2"
        >
          Become a Volunteer
        </a>
      </div>
    </section>
  );
}

