import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, Mail, Lock, User, Sparkles, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [localError, setLocalError] = useState('');

  const { user, login, signup, loading, initialLoading, isSupabaseConfigured } = useAuth();

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Initializing PolyLingo AI Auth...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !formData.name) {
      setLocalError('Please enter your full name');
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = 'An error occurred during authentication';
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (err.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists';
        } else {
          errorMessage = err.message;
        }
      }
      setLocalError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (localError) setLocalError('');
  };

  const fillDemoCredentials = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormData({
      email: 'demo@polylingo.ai',
      password: 'demo123',
      name: 'Demo User'
    });
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Top Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              PolyLingo AI
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin ? 'Access your AI app builder workspace' : 'Start building multilingual AI applications today'}
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl"
        >
          {/* Demo Mode Notification Badge */}
          <div className="mb-6 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Instant Demo Access</span>
            </div>
            <button
              onClick={fillDemoCredentials}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
            >
              Fill Demo Login
            </button>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-6 p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Supabase environment not configured. Login using Demo Mode above.</span>
            </div>
          )}

          {localError && (
            <div className="mb-6 p-3.5 bg-red-500/10 rounded-2xl border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-6 text-center pt-6 border-t border-slate-800">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setLocalError('');
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {isLogin ? (
                <span>Don't have an account? <strong className="text-emerald-400 underline">Sign Up Free</strong></span>
              ) : (
                <span>Already have an account? <strong className="text-emerald-400 underline">Sign In</strong></span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Protected with Supabase RLS & End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
