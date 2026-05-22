import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { useForm } from 'react-hook-form'
import { ShieldAlert, User, Shield, Warehouse, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/axios'

export default function Signup() {
  const { setUser } = useUIStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Role Selection, 2: Form Fields
  const [selectedRole, setSelectedRole] = useState('citizen')
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      experienceLevel: 'none',
      documentUrl: '',
      registrationNumber: '',
    }
  })

  const onSubmit = async (data) => {
    setServerError(null);
    setLoading(true);
    try {
      // Append selected role
      const payload = { ...data, role: selectedRole };
      const response = await api.post('/auth/signup', payload);
      const { success, token, user, error } = response.data;
      if (success) {
        setUser(user, token);
        navigate(`/dashboard/${user.role}`);
      } else {
        setServerError(error || 'Signup failed');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.error || 'Connection failed. Verify server status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 relative">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-lilac/35 rounded-full filter blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-mint/35 rounded-full filter blur-3xl animate-float-reverse -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white/60 dark:bg-dark/60 backdrop-blur-lg border border-lavender/25 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-lavender/10"
      >
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 px-4 text-xs font-bold text-gray-400">
          <span className={step === 1 ? 'text-lavender' : 'text-gray-300'}>1. ONBOARDING ROLE</span>
          <span className={step === 2 ? 'text-lavender' : 'text-gray-300'}>2. CREATING ACCOUNT</span>
        </div>

        {serverError && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-red-600 font-medium">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold font-outfit text-dark dark:text-cream">Choose Your Sphere Role</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select your alignment to load custom dashboard profiles</p>
              </div>

              {/* Roles Panel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {/* Citizen */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('citizen')}
                  className={`p-5 rounded-3xl border-2 text-left flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden ${
                    selectedRole === 'citizen'
                      ? 'border-lavender bg-lavender/5 shadow-md'
                      : 'border-lavender/10 dark:border-white/5 hover:border-lavender/40 hover:bg-lavender/5'
                  }`}
                >
                  <User className="w-6 h-6 text-lavender mb-4" />
                  <div>
                    <h4 className="font-bold text-sm text-dark dark:text-cream leading-snug">Citizen</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Report strays in danger and check status timelines.</p>
                  </div>
                  {selectedRole === 'citizen' && (
                    <div className="absolute top-3 right-3 bg-lavender text-white p-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* Volunteer */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('volunteer')}
                  className={`p-5 rounded-3xl border-2 text-left flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden ${
                    selectedRole === 'volunteer'
                      ? 'border-lavender bg-lavender/5 shadow-md'
                      : 'border-lavender/10 dark:border-white/5 hover:border-lavender/40 hover:bg-lavender/5'
                  }`}
                >
                  <Shield className="w-6 h-6 text-lavender mb-4" />
                  <div>
                    <h4 className="font-bold text-sm text-dark dark:text-cream leading-snug">Volunteer</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Claim cases, get matching coordinates, earn streaks.</p>
                  </div>
                  {selectedRole === 'volunteer' && (
                    <div className="absolute top-3 right-3 bg-lavender text-white p-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* Shelter */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('shelter')}
                  className={`p-5 rounded-3xl border-2 text-left flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden ${
                    selectedRole === 'shelter'
                      ? 'border-lavender bg-lavender/5 shadow-md'
                      : 'border-lavender/10 dark:border-white/5 hover:border-lavender/40 hover:bg-lavender/5'
                  }`}
                >
                  <Warehouse className="w-6 h-6 text-lavender mb-4" />
                  <div>
                    <h4 className="font-bold text-sm text-dark dark:text-cream leading-snug">Shelter/NGO</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Manage intake limits, create adoption lists.</p>
                  </div>
                  {selectedRole === 'shelter' && (
                    <div className="absolute top-3 right-3 bg-lavender text-white p-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-lavender text-white py-3.5 rounded-2xl font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-8"
              >
                Proceed to Details <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-outfit text-dark dark:text-cream">Complete Your Profile</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Creating a <span className="text-lavender font-bold capitalize">{selectedRole}</span> account
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Standard Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                      {...register('name', { required: 'Full name is required' })}
                    />
                    {errors.name && (
                      <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.name.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@pawsphere.org"
                      className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                      {...register('email', { required: 'Email address is required' })}
                    />
                    {errors.email && (
                      <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.email.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                      {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 chars' } })}
                    />
                    {errors.password && (
                      <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.password.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 555-0199"
                      className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                      {...register('phone', { required: selectedRole === 'volunteer' ? 'Phone is required for volunteers' : false })}
                    />
                    {errors.phone && (
                      <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.phone.message}</span>
                    )}
                  </div>
                </div>

                {/* Volunteer Onboarding Fields */}
                {selectedRole === 'volunteer' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 pt-2 border-t border-dashed border-lavender/20"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Experience Level</label>
                        <select
                          className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                          {...register('experienceLevel')}
                        >
                          <option value="none">No experience</option>
                          <option value="beginner">Beginner Rescuer</option>
                          <option value="intermediate">Active Rescuer (1+ Year)</option>
                          <option value="expert">Expert Handler / Vet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ID Document URL (Doc/PDF)</label>
                        <input
                          type="text"
                          placeholder="https://drive.google.com/..."
                          className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                          {...register('documentUrl', { required: 'Verification doc link is required' })}
                        />
                        {errors.documentUrl && (
                          <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.documentUrl.message}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Shelter Onboarding Fields */}
                {selectedRole === 'shelter' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="pt-2 border-t border-dashed border-lavender/20"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">NGO Registration Number</label>
                      <input
                        type="text"
                        placeholder="NGO-XXXX-202X"
                        className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                        {...register('registrationNumber', { required: 'NGO Registration number is required' })}
                      />
                      {errors.registrationNumber && (
                        <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.registrationNumber.message}</span>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 border border-lavender/35 text-lavender hover:bg-lavender/5 py-3 rounded-2xl font-bold font-outfit transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-lavender text-white py-3 rounded-2xl font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all shadow-md shadow-lavender/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Creating Sphere profile...' : 'Complete Register'} <Check className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-lavender font-bold hover:underline">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
