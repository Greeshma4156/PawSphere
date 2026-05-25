import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Shield, Stethoscope, HeartHandshake } from 'lucide-react';
import { cardHover } from '../../animations/presets';

const petsMock = [
  {
    id: 'p1',
    name: 'Bella',
    animalType: 'dog',
    story: 'Indie pup recovered from monsoon drain injuries. Now playful, stable, and ready for adoption.',
    photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=700&q=80',
    medical: 'PASS-BEL-882'
  },
  {
    id: 'p2',
    name: 'Oliver',
    animalType: 'cat',
    story: 'Engine-bay survivor with minor burn recovery. Fully vetted and gentle with humans.',
    photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=700&q=80',
    medical: 'PASS-OLI-190'
  }
];

const shelterMock = {
  name: 'Hope Animal Shelter',
  facilities: ['medical_ward', 'rehabilitation_yard', 'quarantine_zone'],
  capacity: { total: 30, occupied: 3 },
};

export default function ShelterAdoptionPreview() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream">Shelter & Adoption Preview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Available pets, foster-ready listings, and medical passport previews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {petsMock.map((p) => (
            <motion.div
              key={p.id}
              className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm"
              variants={cardHover}
              whileHover="whileHover"
            >
              <div className="h-56 w-full relative">
                <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/80 border border-lavender/20 text-[10px] font-extrabold uppercase tracking-widest text-dark">
                  {p.animalType}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Adoption Ready</div>
                    <div className="mt-1 text-xl font-extrabold text-dark dark:text-cream">{p.name}</div>
                  </div>
                  <div className="shrink-0 w-max text-[10px] font-extrabold text-lavender bg-lavender/10 border border-lavender/20 rounded-full px-3 py-1">
                    Passport: {p.medical}
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">{p.story}</p>

                <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-3 py-1 rounded-full bg-mint/20 border border-mint/30 text-emerald-800 font-extrabold inline-flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Vet checked
                  </span>
                  <span className="px-3 py-1 rounded-full bg-beige/30 border border-lavender/15 text-dark font-extrabold inline-flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4" /> Foster compatible
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <motion.div
            className="bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/10 rounded-[2rem] p-6 shadow-sm"
            variants={cardHover}
            whileHover="whileHover"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender/15 border border-lavender/25 text-lavender flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Shelter Spotlight</div>
                <div className="text-lg font-extrabold text-dark dark:text-cream mt-1">{shelterMock.name}</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl border border-lavender/10 bg-beige/20">
                <div className="text-[11px] font-extrabold text-gray-500">Capacity</div>
                <div className="text-sm font-extrabold text-lavender">{shelterMock.capacity.occupied}/{shelterMock.capacity.total} occupied</div>
              </div>

              <div className="p-3 rounded-2xl border border-lavender/10 bg-beige/20">
                <div className="text-[11px] font-extrabold text-gray-500">Facilities</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shelterMock.facilities.map((f) => (
                    <span key={f} className="px-3 py-1 rounded-full bg-white/70 border border-lavender/15 text-[10px] font-extrabold text-dark dark:text-cream">
                      {f.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 text-[11px] text-gray-500">
              <PawPrint className="w-4 h-4 text-lavender" />
              Medical passports and transfer records are generated per rescue workflow.
            </div>
          </motion.div>

          <div className="flex justify-center">
            <a
              href="/shelter"
              className="px-8 py-3.5 rounded-full bg-lavender text-white text-xs font-extrabold hover:bg-lavender-light shadow-lg shadow-lavender/20 transition-all inline-flex items-center justify-center gap-2"
            >
              Explore Adoption Center
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

