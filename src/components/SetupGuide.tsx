import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, ExternalLink, Copy, Eye, EyeOff, Sparkles, Server, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SetupGuide: React.FC = () => {
  const [step, setStep] = useState(1);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [backendMessage, setBackendMessage] = useState('Checking backend API health...');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkBackendStatus = useCallback(async () => {
    setBackendStatus('checking');
    setBackendMessage('Checking backend API health...');
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setBackendStatus('online');
      setBackendMessage('Backend Node API server is active and reachable.');
    } catch {
      setBackendStatus('offline');
      setBackendMessage('Backend API is offline. Start it with `npm run backend`.');
    }
  }, []);

  useEffect(() => {
    void checkBackendStatus();
  }, [checkBackendStatus]);

  const steps = [
    {
      title: 'Create Supabase Project',
      description: 'Sign up and create a new project on Supabase',
      action: 'Go to Supabase',
      url: 'https://supabase.com'
    },
    {
      title: 'Get Project Credentials',
      description: 'Copy your project URL and anon key from Settings > API',
      action: 'Open Project Settings'
    },
    {
      title: 'Configure Environment',
      description: 'Add your credentials to the .env file',
      action: 'Update .env file'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl"
      >
        {/* Top Notice: No Setup Needed for Demo */}
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white mb-1">No Setup Needed for End Users!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                PolyLingo AI includes instant Demo Mode and browser storage. You can start creating AI applications right away without any database setup.
              </p>
            </div>
          </div>
          <Link
            to="/auth"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <span>Try Demo Mode</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Section Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Database className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Developer & Self-Hosting Integration Guide</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Instructions for developers and administrators looking to connect custom Supabase cloud databases and API keys.
          </p>
        </div>

        {/* Backend API Status Banner */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-slate-400" />
              <div>
                <h3 className="text-xs font-bold text-white">Node Integration API Server</h3>
                <p
                  className={`text-xs ${
                    backendStatus === 'online'
                      ? 'text-emerald-400 font-semibold'
                      : backendStatus === 'offline'
                        ? 'text-red-400 font-semibold'
                        : 'text-slate-400'
                  }`}
                >
                  {backendMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => void checkBackendStatus()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
            >
              Recheck Status
            </button>
          </div>
        </div>

        {/* Progress Steps Header */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                step > index + 1 
                  ? 'bg-emerald-500 text-slate-950' 
                  : step === index + 1 
                    ? 'bg-cyan-500 text-slate-950' 
                    : 'bg-slate-800 text-slate-400'
              }`}>
                {step > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-14 h-1 mx-2 rounded ${
                  step > index + 1 ? 'bg-emerald-500' : 'bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Step {step}: {steps[step - 1].title}
            </h3>
            <p className="text-xs text-slate-400">{steps[step - 1].description}</p>
          </div>

          {step === 1 && (
            <div className="space-y-4 text-xs text-slate-300">
              <p>To connect a custom database for cloud storage and authentication:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-400">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">Supabase.com</a> and sign in or create an account</li>
                <li>Click <strong>New Project</strong> and enter a project name & password</li>
                <li>Select your nearest region and wait for the database initialization to complete</li>
              </ol>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors mt-2"
              >
                Go to Supabase Dashboard <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">Enter your project credentials from your Supabase Dashboard Settings &gt; API:</p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Anon API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">Add the following lines to your project's <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">.env</code> file:</p>
              
              <div className="relative bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
                <pre className="whitespace-pre-wrap">{`VITE_SUPABASE_URL=${supabaseUrl || 'your_supabase_url'}
VITE_SUPABASE_ANON_KEY=${supabaseKey || 'your_supabase_anon_key'}`}</pre>
                <button
                  onClick={() => copyToClipboard(`VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${supabaseKey}`)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white flex items-center gap-1 text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            Previous Step
          </button>
          
          <button
            onClick={() => setStep(Math.min(steps.length, step + 1))}
            disabled={step === steps.length}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 shadow-lg"
          >
            Next Step
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupGuide;
