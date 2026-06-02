import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { useForm } from 'react-hook-form'
import { ShieldAlert, User, Shield, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/axios'

export default function Signup() {
  const { setUser } = useUIStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Role Selection, 2: Form Fields
  const [selectedRole, setSelectedRole] = useState('citizen')
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

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

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak ⚠️', color: 'bg-red-500 w-1/3' };
    if (score <= 4) return { score, label: 'Medium 👍', color: 'bg-amber-400 w-2/3' };
    return { score, label: 'Strong 💪🔥', color: 'bg-emerald-500 w-full' };
  };

  const strength = getPasswordStrength(passwordValue);

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-cream via-cream to-beige/25 dark:from-dark dark:via-dark dark:to-dark/95">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-lilac/15 rounded-full filter blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-mint/15 rounded-full filter blur-3xl animate-float-reverse -z-10"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 bg-white/70 dark:bg-dark/70 backdrop-blur-xl border border-lavender/25 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl p-6 md:p-8">
        
        {/* Onboarding Sidebar */}
        <div className="hidden md:flex md:col-span-4 bg-gradient-to-tr from-lavender/90 to-lilac/85 rounded-[2.5rem] p-8 text-white flex-col justify-between relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80')` }} />
          
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Onboarding Wizard</span>
            <h3 className="font-outfit text-2xl font-extrabold mt-6 leading-tight">Create Your Stray Shield.</h3>
            <p className="text-xs text-white/85 mt-2 leading-relaxed font-normal">Choose your alignment to configure reporting maps, vet tracking sheets, and customized consoles.</p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
              <span>🌟</span> Onboarding Stepper
            </div>
            <div className="mt-2 space-y-1.5 text-[10px] text-white/90">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-white text-lavender' : 'bg-white/20'}`}>1</span>
                <span>Select Portal Role</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-white text-lavender' : 'bg-white/20'}`}>2</span>
                <span>Onboard Credentials</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Content Panel */}
        <div className="col-span-1 md:col-span-8 flex flex-col justify-center px-2 py-4">
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-red-600 font-medium">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{serverError}</span>
            </motion.div>
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
                <div>
                  <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream leading-tight">Choose Your Sphere Role</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select your alignment to load tailored consoles & widgets</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      role: 'citizen',
                      icon: <User className="w-6 h-6" />,
                      title: 'Citizen & Shelter Coordinator',
                      desc: 'Report emergencies, track cases, sponsor treatments, and access shelter consoles to manage capacity, medical passports, & foster queues.',
                      badge: 'All-in-One Console',
                      badgeColor: 'bg-mint/20 text-emerald-700 dark:text-emerald-400',
                    },
                    {
                      role: 'volunteer',
                      icon: <Shield className="w-6 h-6" />,
                      title: 'Volunteer First Responder',
                      desc: 'Accept nearby rescue missions, navigate to locations, update active rescue status, and coordinate field transfers.',
                      badge: 'Verification Required',
                      badgeColor: 'bg-peach/20 text-orange-700 dark:text-orange-400',
                    },
                  ].map(({ role, icon, title, desc, badge, badgeColor }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        selectedRole === role
                          ? 'border-lavender bg-lavender/5 shadow-lg shadow-lavender/10'
                          : 'border-lavender/15 dark:border-white/5 hover:border-lavender/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${selectedRole === role ? 'bg-lavender text-white' : 'bg-beige/40 dark:bg-white/5 text-lavender'}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-dark dark:text-cream">{title}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
                        </div>
                        {selectedRole === role && (
                          <Check className="w-4 h-4 text-lavender shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-lavender text-white py-3.5 rounded-2xl font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-8 hover:scale-[1.01] active:scale-[0.99]"
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
                <div className="mb-6">
                  <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream leading-tight">Complete Onboarding</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Registering as a <span className="text-lavender font-bold capitalize">{selectedRole}</span> partner
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  {/* Standard details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        className={`w-full bg-beige/10 dark:bg-dark/50 border p-3 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream ${
                          errors.name ? 'border-red-500' : 'border-lavender/20 dark:border-white/5'
                        }`}
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
                        className={`w-full bg-beige/10 dark:bg-dark/50 border p-3 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream ${
                          errors.email ? 'border-red-500' : 'border-lavender/20 dark:border-white/5'
                        }`}
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
                        className={`w-full bg-beige/10 dark:bg-dark/50 border p-3 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream ${
                          errors.password ? 'border-red-500' : 'border-lavender/20 dark:border-white/5'
                        }`}
                        {...register('password', { 
                          required: 'Password is required', 
                          minLength: { value: 6, message: 'Minimum 6 characters' } 
                        })}
                        onChange={(e) => setPasswordValue(e.target.value)}
                      />
                      
                      {/* Password Strength Meter */}
                      {passwordValue && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-gray-400">
                            <span>Security Strength:</span>
                            <span className="text-lavender">{strength.label}</span>
                          </div>
                          <div className="h-1 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                            <div className={`h-full transition-all duration-300 ${strength.color}`}></div>
                          </div>
                        </div>
                      )}
                      
                      {errors.password && (
                        <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.password.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className={`w-full bg-beige/10 dark:bg-dark/50 border p-3 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream ${
                          errors.phone ? 'border-red-500' : 'border-lavender/20 dark:border-white/5'
                        }`}
                        {...register('phone', { required: selectedRole === 'volunteer' ? 'Phone is required for volunteers' : false })}
                      />
                      {errors.phone && (
                        <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.phone.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Volunteer Fields */}
                  {selectedRole === 'volunteer' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-4 pt-3 border-t border-dashed border-lavender/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Handler Background</label>
                          <select
                            className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/20 dark:border-white/5 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                            {...register('experienceLevel')}
                          >
                            <option value="none">No rescue background</option>
                            <option value="beginner">Beginner Rescuer</option>
                            <option value="intermediate">Active Rescuer (1+ Year)</option>
                            <option value="expert">Expert Handler / Vet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ID Document (Google Drive Link)</label>
                          <input
                            type="text"
                            placeholder="https://drive.google.com/..."
                            className={`w-full bg-beige/10 dark:bg-dark/50 border p-3 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream ${
                              errors.documentUrl ? 'border-red-500' : 'border-lavender/20 dark:border-white/5'
                            }`}
                            {...register('documentUrl', { required: 'Verification doc link is required' })}
                          />
                          {errors.documentUrl && (
                            <span className="text-[9px] text-red-500 font-semibold mt-1 ml-1 block">{errors.documentUrl.message}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}


                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 border border-lavender/35 text-lavender hover:bg-lavender/5 py-3 rounded-2xl font-bold font-outfit transition-all flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.01]"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-lavender text-white py-3 rounded-2xl font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all shadow-md shadow-lavender/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deploying Credentials...
                        </>
                      ) : (
                        <>Complete Onboarding <Check className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
            Already registered?{' '}
            <Link to="/login" className="text-lavender font-extrabold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
