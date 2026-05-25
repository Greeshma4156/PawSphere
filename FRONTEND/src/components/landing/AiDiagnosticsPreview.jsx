import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Search, ShieldCheck } from 'lucide-react';
import { cardHover } from '../../animations/presets';

const mockScan = {
  severity: {
    label: 'High',
    confidence: 86,
    reasoning: 'Photo heuristics match injury indicators: swelling + limping behavior.'
  },
  urgency: {
    label: 'Urgent Dispatch',
    score: 92,
    eta: '6–15 min'
  },
  duplicateDetection: {
    possibleDuplicate: true,
    confidence: 71,
    matchedCaseId: 'case_id_2'
  },
  recommendations: [
    { title: 'Dispatch nearest verified volunteer', detail: 'Prioritize responders within your radius.' },
    { title: 'Prepare triage kit', detail: 'Bandage + saline + safe handling checklist.' },
    { title: 'Request clinic sponsorship', detail: 'Auto-link to medical campaign stage.' }
  ]
};

function ResultCard({ icon, title, children }) {
  return (
    <motion.div
      className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-5 shadow-sm"
      variants={cardHover}
      whileHover="whileHover"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">{title}</div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function AiDiagnosticsPreview() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">AI Diagnostics Preview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Animated mock scan: severity analysis, urgency scoring, and duplicate detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <ResultCard
            icon={<Sparkles className="w-5 h-5" />}
            title="Injury Severity"
          >
            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-2xl font-extrabold text-lavender">{mockScan.severity.label}</div>
                <div className="text-xs font-bold text-gray-500">Confidence</div>
              </div>
              <div className="mt-1 text-sm font-extrabold text-dark dark:text-cream">{mockScan.severity.confidence}%</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{mockScan.severity.reasoning}</p>
            </div>
          </ResultCard>

          <ResultCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Urgency Score"
          >
            <div className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xl font-extrabold text-dark dark:text-cream">{mockScan.urgency.score}</div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-mint/20 border border-mint/30 text-emerald-800 px-3 py-1 rounded-full">
                  {mockScan.urgency.label}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">ETA: <span className="font-bold text-lavender">{mockScan.urgency.eta}</span></div>
            </div>
          </ResultCard>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ResultCard
            icon={<Search className="w-5 h-5" />}
            title="Duplicate Detection"
          >
            <div className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-dark dark:text-cream">
                    {mockScan.duplicateDetection.possibleDuplicate ? 'Possible duplicate' : 'No duplicates found'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Confidence: <span className="font-bold text-lavender">{mockScan.duplicateDetection.confidence}%</span>
                  </div>
                </div>
              </div>
              {mockScan.duplicateDetection.possibleDuplicate && (
                <div className="mt-3 text-xs font-bold text-gray-500 bg-beige/30 border border-lavender/15 rounded-xl px-3 py-2">
                  Match: {mockScan.duplicateDetection.matchedCaseId}
                </div>
              )}
            </div>
          </ResultCard>

          <div className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-peach/20 border border-peach/30 text-orange-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Recommendations</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {mockScan.recommendations.map((r, idx) => (
                <div key={idx} className="p-3 rounded-2xl border border-lavender/15 bg-beige/20">
                  <div className="text-xs font-extrabold text-dark dark:text-cream">{r.title}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{r.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          className="px-8 py-3.5 rounded-full bg-lavender text-white font-extrabold text-xs hover:bg-lavender-light shadow-lg shadow-lavender/20 transition-all"
          onClick={() => {
            const el = document.getElementById('ai-diagnostics-results');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Run AI Rescue Scan
        </button>
      </div>

      <div id="ai-diagnostics-results" className="sr-only" aria-hidden="true" />
    </section>
  );
}

