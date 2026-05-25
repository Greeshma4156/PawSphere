import React from 'react'

export default function MedicalPassportCard({ passport }) {
  return (
    <div className="rounded-[2rem] bg-white/75 dark:bg-dark/75 backdrop-blur-md border border-lavender/20 dark:border-white/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Medical Passport</div>
          <div className="mt-2 text-sm font-extrabold text-dark dark:text-cream">{passport.medicalPassportId || passport._id || 'PASS-—'}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{passport.name} • {passport.animalType}</div>
        </div>
        {passport.qrCodeUrl ? (
          <div className="w-14 h-14 rounded-2xl bg-beige/20 border border-lavender/15 overflow-hidden flex items-center justify-center">
            <img src={passport.qrCodeUrl} alt="QR" className="w-full h-full object-cover" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

