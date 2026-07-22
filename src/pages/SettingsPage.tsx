import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft, Settings, ShieldCheck, Key, User, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, avatar_url: avatarUrl });
      toast.success('Account profile updated successfully.', 'Saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile.', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const integrations = [
    { name: 'ElevenLabs Voice AI', status: 'Connected', badge: 'Active' },
    { name: 'Lingo Translation API', status: 'Connected', badge: 'Active' },
    { name: 'Dappier AI Completion', status: 'Connected', badge: 'Active' },
    { name: 'Netlify Site Deployer', status: 'Configured', badge: 'Active' },
    { name: 'RevenueCat Monetization', status: 'Available', badge: 'Optional' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                PolyLingo AI
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                Dashboard
              </Link>
              <Link
                to="/"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Settings className="w-7 h-7 text-emerald-400" />
            Account & Workspace Settings
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your user profile, authentication preferences, and active service integrations.
          </p>
        </div>

        <div className="space-y-8">
          {/* User Profile Form */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              User Profile Information
            </h2>

            <form onSubmit={handleSave} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Email</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avatar URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors mt-2"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Service Integrations Table */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-400" />
              API Provider Integrations
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Backend service integrations automatically proxy key requests securely without exposing secrets to the browser.
            </p>

            <div className="space-y-3">
              {integrations.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & RLS Status */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Database Security Policy</h3>
                <p className="text-xs text-slate-400">PostgreSQL Row Level Security (RLS) is active on user tables.</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              Active
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
