import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative z-10"
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-950 shadow-lg shadow-emerald-500/20">
          <Bot className="w-8 h-8" />
        </div>

        <div className="text-6xl font-black text-emerald-400 mb-2">404</div>
        <h1 className="text-xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          The page or route you requested does not exist or has been moved. Explore our platform using the links below.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Sign In
            </Link>
          )}

          <Link
            to="/"
            className="flex-1 py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Home Page
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
