import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { useForm } from 'react-hook-form'
import { Lock, Mail, ShieldAlert, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/axios'

export default function Login() {
  const { setUser } = useUIStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const isExpired = searchParams.get('expired') === 'true'

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  })

  const onSubmit = async (data) => {
    setServerError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { success, token, user, error } = response.data;
      if (success) {
        setUser(user, token);
        navigate(`/dashboard/${user.role}`);
      } else {
        setServerError(error || 'Login failed');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.error || 'Server connection failed. Double check backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate OAuth Delay
    setTimeout(() => {
      // Mock log in as citizen
      const mockUser = {
        _id: 'user_oauth_' + Date.now(),
        name: 'Alex Mercer (Google)',
        email: 'alex@gmail.com',
        role: 'citizen',
        createdAt: new Date()
      };
      setUser(mockUser, 'mock_oauth_jwt_token_xxxx');
      navigate('/dashboard/citizen');
      setLoading(false);
    }, 1200);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotPasswordOpen(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-cream via-cream to-beige/25 dark:from-dark dark:via-dark dark:to-dark/95">
      {/* Background ambient blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-lavender/10 rounded-full filter blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-peach/10 rounded-full filter blur-3xl animate-float-reverse -z-10"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 bg-white/70 dark:bg-dark/70 backdrop-blur-xl border border-lavender/25 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl p-6 md:p-8">
        
        {/* Visual Hero Panel (Split Screen Desktop) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-tr from-lavender/90 to-peach/85 rounded-[2.5rem] p-8 text-white flex-col justify-between relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80')` }} />
          
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Secure Entry Portal</span>
            <h3 className="font-outfit text-3xl font-extrabold mt-6 leading-tight">Every login helps save a life.</h3>
            <p className="text-xs text-white/85 mt-2 leading-relaxed font-normal">Connect with stray campaigns, volunteer schedules, and real-time medical updates.</p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-sm">🛡️</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">Trust Assurance</span>
            </div>
            <p className="text-[10px] text-white/90 mt-1">Verifiable ledger receipts, transparent fund trackers, and verified NGO approvals.</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="col-span-1 md:col-span-7 flex flex-col justify-center px-2 py-4">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold font-outfit text-dark dark:text-cream leading-tight">Welcome Back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coordinate stray rescues and medical campaigns</p>
          </div>

          {isExpired && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-amber-700 font-medium">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>Session expired. Please log in again to restore connection.</span>
            </motion.div>
          )}

          {serverError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-red-600 font-medium">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{serverError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@pawsphere.org"
                  className={`w-full bg-beige/10 dark:bg-dark/50 border p-3.5 pl-12 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'border-lavender/20 dark:border-white/5 focus:border-lavender'
                  }`}
                  {...register('email', { required: 'Email address is required' })}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 ml-1 block">{errors.email.message}</span>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5 px-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[10px] font-bold text-lavender hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-beige/10 dark:bg-dark/50 border p-3.5 pl-12 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream ${
                    errors.password 
                      ? 'border-red-500' 
                      : 'border-lavender/20 dark:border-white/5 focus:border-lavender'
                  }`}
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-500 font-semibold mt-1 ml-1 block">{errors.password.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lavender text-white py-3.5 rounded-2xl font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all shadow-md shadow-lavender/20 mt-6 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Securing Session...
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4.5 h-4.5" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
            <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Continue With</span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
          </div>

          {/* Social Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-lavender/25 bg-white dark:bg-white/5 hover:bg-lavender/5 dark:hover:bg-white/10 py-3 rounded-2xl text-xs font-bold text-dark dark:text-cream transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google OAuth sandbox
          </button>

          <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
            New to PawSphere?{' '}
            <Link to="/signup" className="text-lavender font-extrabold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Panel */}
      <AnimatePresence>
        {forgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 dark:bg-dark/95 backdrop-blur-md border border-lavender/25 dark:border-white/10 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-beige/40 dark:bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <span className="text-lg block">📬</span>
                <h3 className="font-extrabold font-outfit text-lg mt-3 text-dark dark:text-cream leading-tight">
                  Recover Credentials
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Enter your email address and we'll transmit password reset directives instantly.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs">
                  <div className="w-12 h-12 bg-mint text-emerald-700 rounded-full flex items-center justify-center text-xl mb-3 animate-bounce border-2 border-emerald-300">
                    ✓
                  </div>
                  <h4 className="font-bold text-dark dark:text-cream">Reset Email Sent!</h4>
                  <p className="text-gray-400 mt-1 max-w-[200px]">Check your inbox for simulated credentials.</p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="alex@gmail.com"
                      className="w-full px-4 py-3 border border-lavender/20 dark:border-white/10 rounded-2xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-lavender text-white font-bold rounded-2xl text-xs hover:bg-lavender-light hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    Send Recovery Email
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
