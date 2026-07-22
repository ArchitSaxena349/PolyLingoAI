import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, LayoutDashboard } from 'lucide-react';
import VoiceCloner from '../components/VoiceCloner';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const VoiceCloningStudioPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const handleVoiceCloned = (voiceId: string, voiceName: string) => {
    toast.success(`Voice "${voiceName}" (ID: ${voiceId.slice(0, 12)}...) cloned successfully!`, 'Voice Ready');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                ElevenLabs Voice Studio
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  Sign In
                </Link>
              )}

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

      {/* Main Studio Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Custom Voice Cloning
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Upload audio samples or record directly to train realistic voice synthesis models powered by ElevenLabs API.
          </p>
        </div>

        <VoiceCloner onVoiceCloned={handleVoiceCloned} />
      </main>
    </div>
  );
};

export default VoiceCloningStudioPage;
