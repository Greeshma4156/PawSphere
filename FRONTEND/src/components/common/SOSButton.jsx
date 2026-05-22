import React, { useState } from 'react'
import { AlertOctagon, Phone, Share2, ShieldAlert, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'

export default function SOSButton() {
  const { isSOSActive, toggleSOS, setSOSActive } = useUIStore()
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const text = 'EMERGENCY: Stray animal reported in critical condition. Open PawSphere map to locate: http://localhost:3000/map';
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Floating SOS Trigger Button */}
      <motion.button
        onClick={toggleSOS}
        className="fixed bottom-6 right-6 z-50 bg-red-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors focus:ring-4 focus:ring-red-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Trigger SOS emergency report"
      >
        <ShieldAlert className="w-8 h-8 animate-pulse" />
        <span className="sr-only">SOS Emergency</span>
      </motion.button>

      {/* SOS Panel overlay */}
      <AnimatePresence>
        {isSOSActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark border-2 border-red-500/20 max-w-md w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient decorative glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10"></div>

              {/* Close Button */}
              <button
                onClick={() => setSOSActive(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-dark dark:hover:text-cream transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertOctagon className="w-8 h-8" />
                <h3 className="text-2xl font-bold font-outfit">SOS Emergency Hub</h3>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                If you have spotted an animal in critical life-threatening danger, use the options below to coordinate immediate support.
              </p>

              <div className="space-y-4">
                {/* Emergency Hotlines */}
                <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-dark dark:text-cream text-sm">PawSphere Emergency Line</h4>
                    <p className="text-xs text-red-500 font-medium mt-0.5">+1 555-9000 (Available 24/7)</p>
                  </div>
                  <a
                    href="tel:+15559000"
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>

                {/* Share Coordinates */}
                <button
                  onClick={handleShare}
                  className="w-full p-4 bg-mint/30 dark:bg-mint/10 hover:bg-mint/40 dark:hover:bg-mint/20 border border-mint rounded-2xl flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div>
                    <h4 className="font-semibold text-dark dark:text-cream text-sm">WhatsApp Broadcast</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Alert local rescuer groups instantly</p>
                  </div>
                  <div className="p-3 bg-mint text-dark rounded-full">
                    <Share2 className="w-5 h-5" />
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => {
                    setSOSActive(false);
                    // Navigate to reporting page
                    window.location.href = '/dashboard/citizen?action=report&urgency=critical';
                  }}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-600 transition-all font-outfit shadow-md shadow-red-500/20"
                >
                  File SOS Digital Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
