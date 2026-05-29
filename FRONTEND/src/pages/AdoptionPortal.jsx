import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Filter, ShieldCheck, QrCode, FileText, CheckCircle, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import { useUIStore } from '../store/uiStore';

export default function AdoptionPortal() {
  const { user } = useUIStore();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [animalType, setAnimalType] = useState('');
  const [age, setAge] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Pet for Details/Passport Modal
  const [selectedPet, setSelectedPet] = useState(null);
  const [passportOpen, setPassportOpen] = useState(false);

  // Application Modal state
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Application form data
  const [formData, setFormData] = useState({
    houseType: 'apartment',
    workingHours: '9-5',
    hasOtherPets: 'no',
    experience: 'beginner',
    agreement: false
  });

  useEffect(() => {
    fetchPets();
  }, [animalType, age]);

  const fetchPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (animalType) params.animalType = animalType;
      if (age) params.age = age;
      if (searchQuery) params.breed = searchQuery;

      const response = await api.get('/adoptions', { params });
      setPets(response.data.data || []);
    } catch (err) {
      console.error('Failed to retrieve adoptable pets:', err);
      setError('Could not establish connection to the rescue server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPets();
  };

  const handleOpenPassport = (pet) => {
    setSelectedPet(pet);
    setPassportOpen(true);
  };

  const handleOpenApply = (pet) => {
    setSelectedPet(pet);
    setApplyStep(1);
    setApplySuccess(false);
    setApplyOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreement) {
      alert('You must check the agreement check box to proceed.');
      return;
    }
    setApplying(true);
    try {
      await api.post(`/adoptions/${selectedPet._id}/apply`);
      setApplySuccess(true);
      setTimeout(() => {
        setApplyOpen(false);
        fetchPets(); // Refresh statuses
      }, 2500);
    } catch (err) {
      console.error('Adoption application failure:', err);
      alert('Failed to transmit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative min-h-[90vh]">
      {/* Dynamic ambient blurs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-mint/10 rounded-full filter blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-lavender/10 rounded-full filter blur-3xl animate-float-reverse -z-10"></div>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-mint/15 border border-mint/25 rounded-full text-xs font-bold text-emerald-800 dark:text-mint uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Direct Shelter Adoptions
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-outfit tracking-tight text-dark dark:text-cream leading-tight">
          Rescue & Clear the Shelters
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
          Search verified rescued strays ready for foster care. Track recovery and vaccine schedules directly via blockchain-verifiable digital health passports.
        </p>
      </div>

      {/* Search & Filtering Systems */}
      <div className="bg-white/70 dark:bg-dark/70 backdrop-blur-xl border border-lavender/20 dark:border-white/5 rounded-3xl p-6 shadow-xl mb-12">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Query breed search */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by breed (e.g. Indie Stray, Calico)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/15 p-3.5 pl-12 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
            />
          </div>

          {/* Species */}
          <div className="md:col-span-3">
            <select
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
              className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/15 p-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream font-medium"
            >
              <option value="">All Species</option>
              <option value="dog">Dogs Only</option>
              <option value="cat">Cats Only</option>
              <option value="bird">Birds Only</option>
              <option value="other">Other Animals</option>
            </select>
          </div>

          {/* Age range */}
          <div className="md:col-span-3">
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/15 p-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream font-medium"
            >
              <option value="">All Ages</option>
              <option value="6 Months">Puppy / Kitten (&lt; 1 Yr)</option>
              <option value="1 Year">Young Adult (1-2 Yrs)</option>
              <option value="Senior">Senior (&gt; 7 Yrs)</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full bg-lavender text-white p-3.5 rounded-2xl font-bold flex items-center justify-center shadow-lg hover:bg-lavender-light hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-lavender/30 border-t-lavender rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-semibold bg-red-500/10 border border-red-500/25 rounded-3xl">
          {error}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-dark/40 border border-lavender/10 rounded-[2.5rem]">
          <span className="text-3xl block mb-2">🐾</span>
          <h3 className="text-lg font-bold font-outfit text-dark dark:text-cream">No adoptable strays matching query</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">Check back later or adjust your species and breed search parameters!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pets.map((pet) => (
            <motion.div
              key={pet._id}
              className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/25 dark:border-white/5 rounded-[2rem] p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all"
              whileHover={{ y: -6 }}
            >
              <div>
                {/* Pet Image Frame */}
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative border border-lavender/10 mb-4 bg-beige/30">
                  <img
                    src={pet.photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80"}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-dark/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-lavender border border-lavender/25 shadow-sm">
                    {pet.animalType}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-extrabold uppercase shadow-sm">
                    {pet.status.replace('_', ' ')}
                  </div>
                </div>

                <h3 className="font-extrabold font-outfit text-xl text-dark dark:text-cream leading-tight flex items-center justify-between">
                  {pet.name}
                  <span className="text-xs font-bold text-lavender bg-lavender/5 px-2.5 py-1 rounded-full border border-lavender/15">{pet.breed}</span>
                </h3>
                
                <p className="text-xs text-gray-400 mt-1.5 select-none font-bold">Age: <span className="text-dark dark:text-cream font-normal">{pet.age}</span></p>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3 line-clamp-3 mb-4 font-normal">
                  {pet.story}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4 pt-4 border-t border-lavender/10 dark:border-white/5">
                <button
                  onClick={() => handleOpenPassport(pet)}
                  className="w-full border border-lavender/25 dark:border-white/10 hover:border-lavender/70 bg-transparent py-2.5 rounded-xl text-xs font-bold text-dark dark:text-cream flex items-center justify-center gap-1.5 hover:bg-lavender/5 transition-all"
                >
                  <FileText className="w-4 h-4 text-lavender" /> Digital Health Passport
                </button>
                <button
                  onClick={() => handleOpenApply(pet)}
                  disabled={pet.status !== 'available'}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                    pet.status === 'available'
                      ? 'bg-lavender text-white hover:bg-lavender-light hover:scale-[1.01]'
                      : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 shadow-none cursor-not-allowed'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" /> Apply for Adoption
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal 1: Health Passport Details */}
      <AnimatePresence>
        {passportOpen && selectedPet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/45 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark border border-lavender/25 dark:border-white/10 rounded-[2.5rem] p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setPassportOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-beige/40 dark:bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
              >
                ✕
              </button>

              {/* Passport Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-lavender/15">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-lavender">
                  <img src={selectedPet.photo} alt={selectedPet.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-lavender/10 text-lavender border border-lavender/20 rounded-full text-[10px] font-bold uppercase w-max tracking-wider">
                    Digital Health Passport
                  </div>
                  <h3 className="font-extrabold font-outfit text-xl mt-1 text-dark dark:text-cream">
                    {selectedPet.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold">UID: <span className="font-mono text-dark dark:text-cream select-all">{selectedPet.medicalPassportId}</span></p>
                </div>
              </div>

              {/* Passport Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Vaccination Records */}
                <div>
                  <h4 className="text-xs font-extrabold text-dark dark:text-cream uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🛡️ Vaccination Record
                  </h4>
                  <div className="space-y-2">
                    {selectedPet.vaccinations.length === 0 ? (
                      <p className="text-xs text-gray-400">No vaccine history registered.</p>
                    ) : (
                      selectedPet.vaccinations.map((vac, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-beige/25 dark:bg-white/5 p-2.5 rounded-xl border border-lavender/5">
                          <div className="text-xs">
                            <p className="font-bold text-dark dark:text-cream leading-tight">{vac.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(vac.date).toLocaleDateString()}</p>
                          </div>
                          <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-500/10">
                            {vac.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Treatment History */}
                <div>
                  <h4 className="text-xs font-extrabold text-dark dark:text-cream uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🏥 Medical Care & Health Logs
                  </h4>
                  <div className="space-y-2.5">
                    {selectedPet.healthLog.length === 0 ? (
                      <p className="text-xs text-gray-400">No medical histories logged.</p>
                    ) : (
                      selectedPet.healthLog.map((log, idx) => (
                        <div key={idx} className="bg-beige/25 dark:bg-white/5 p-2.5 rounded-xl border border-lavender/5 text-xs">
                          <div className="flex justify-between font-bold text-dark dark:text-cream leading-tight">
                            <span>{log.treatment || 'Checkup'}</span>
                            <span className="text-[9px] font-normal text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-normal">{log.notes}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* QR and Trust Info */}
              <div className="bg-lavender/5 dark:bg-white/5 p-4 rounded-2xl border border-lavender/10 mt-6 flex flex-col md:flex-row items-center gap-4">
                <div className="p-2 bg-white dark:bg-dark rounded-xl border border-lavender/15">
                  <QrCode className="w-12 h-12 text-dark dark:text-cream" />
                </div>
                <div className="text-left text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                  <p className="font-bold text-dark dark:text-cream flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verifiable Smart Receipt
                  </p>
                  This digital passport utilizes verifiably hash codes mapped directly against treatment bills, ensuring 100% transparent shelter medical tracking.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Multi-step Adoption Application Form */}
      <AnimatePresence>
        {applyOpen && selectedPet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/45 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark border border-lavender/25 dark:border-white/10 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setApplyOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-beige/40 dark:bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-lavender bg-lavender/10 px-3.5 py-1 rounded-full">
                  Adopt Application
                </span>
                <h3 className="font-extrabold font-outfit text-lg mt-3 text-dark dark:text-cream leading-tight">
                  Application for {selectedPet.name}
                </h3>
              </div>

              {applySuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce mb-3" />
                  <h4 className="font-bold text-base text-dark dark:text-cream">Application Transmitted!</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                    We have successfully broadcasted your request to the Hope Animal Shelter team. Track your dashboard to schedule matching trials!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
                  
                  {/* Step 1: Lifestyle Questions */}
                  {applyStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Household Environment</label>
                        <select
                          value={formData.houseType}
                          onChange={(e) => setFormData({ ...formData, houseType: e.target.value })}
                          className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/25 p-3 rounded-xl text-xs dark:text-cream focus:outline-none"
                        >
                          <option value="apartment">Apartment / Condominium</option>
                          <option value="house_yard">House with fenced yard</option>
                          <option value="studio">Small Studio</option>
                          <option value="other">Other space</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Typical Daily working hours</label>
                        <select
                          value={formData.workingHours}
                          onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                          className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/25 p-3 rounded-xl text-xs dark:text-cream focus:outline-none"
                        >
                          <option value="remote">Work from home (Remote)</option>
                          <option value="9-5">Standard 9-5 outside house</option>
                          <option value="flexible">Part-time / Flexible hours</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setApplyStep(2)}
                        className="w-full py-3 bg-lavender text-white font-bold rounded-xl text-xs hover:bg-lavender-light hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                      >
                        Next Step <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Animal History & Agreement */}
                  {applyStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Previous Pet Ownership History</label>
                        <select
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/25 p-3 rounded-xl text-xs dark:text-cream focus:outline-none"
                        >
                          <option value="beginner">First time owner</option>
                          <option value="intermediate">Owned 1-2 pets previously</option>
                          <option value="expert">Experienced rescuer / trainer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">Do you currently house other animals?</label>
                        <select
                          value={formData.hasOtherPets}
                          onChange={(e) => setFormData({ ...formData, hasOtherPets: e.target.value })}
                          className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/25 p-3 rounded-xl text-xs dark:text-cream focus:outline-none"
                        >
                          <option value="no">No</option>
                          <option value="yes_dog">Yes, another dog</option>
                          <option value="yes_cat">Yes, another cat</option>
                        </select>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2">
                        <input
                          type="checkbox"
                          id="agreement"
                          checked={formData.agreement}
                          onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                          className="mt-1"
                          required
                        />
                        <label htmlFor="agreement" className="text-[10px] text-gray-500 leading-normal select-none">
                          I pledge that I am financially capable and emotionally committed to providing a caring, safe, and nurturing environment for {selectedPet.name}.
                        </label>
                      </div>

                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setApplyStep(1)}
                          className="w-1/3 border border-lavender text-lavender font-bold py-3 rounded-xl text-xs hover:bg-lavender/5 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          type="submit"
                          disabled={applying}
                          className="w-2/3 bg-lavender text-white font-bold py-3 rounded-xl text-xs hover:bg-lavender-light hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          {applying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Transmitting...
                            </>
                          ) : (
                            <>Submit Application</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
