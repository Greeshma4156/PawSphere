import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { useForm } from 'react-hook-form'
import { Lock, Mail, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../lib/axios'

export default function Login() {
  const { setUser } = useUIStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
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
        // Direct route based on user role
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 relative">
      {/* Background ambient blurs */}
      <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-lavender/25 rounded-full filter blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-peach/25 rounded-full filter blur-3xl animate-float-reverse -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/60 dark:bg-dark/60 backdrop-blur-lg border border-lavender/25 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-lavender/10"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-lavender/10 text-lavender rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm border border-lavender/20">
            🔑
          </div>
          <h2 className="text-2xl font-bold font-outfit text-dark dark:text-cream">Welcome Back</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sign in to access your coordination console</p>
        </div>

        {isExpired && (
          <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-amber-700 font-medium">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span>Session expired. Please log in again to restore connection.</span>
          </div>
        )}

        {serverError && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-red-600 font-medium">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="you@pawsphere.org"
                className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3.5 pl-12 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
                {...register('email', { required: 'Email address is required' })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 font-semibold mt-1 ml-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white dark:bg-dark border border-lavender/20 dark:border-white/5 p-3.5 pl-12 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender/35 dark:text-cream"
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
            className="w-full bg-lavender text-white py-3.5 rounded-2xl font-bold font-outfit hover:bg-lavender-light hover:text-lavender transition-all shadow-md shadow-lavender/20 mt-6 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Securing Session...' : 'Sign In'} <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400">
          New to PawSphere?{' '}
          <Link to="/signup" className="text-lavender font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
