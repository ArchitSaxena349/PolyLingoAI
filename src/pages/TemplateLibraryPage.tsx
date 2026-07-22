import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot,
  Mic,
  Globe,
  ArrowLeft,
  Sparkles,
  Layers,
  ArrowRight,
  Wand2,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react';
import { useAppBuilder, AppComponent } from '../contexts/AppBuilderContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: any;
  gradient: string;
  components: Omit<AppComponent, 'id'>[];
}

const templates: TemplateItem[] = [
  {
    id: 'customer-support-assistant',
    title: 'Customer Support Assistant',
    category: 'Conversational AI',
    description: 'An intelligent AI support chatbot with multi-language translation and voice response capabilities.',
    icon: Bot,
    gradient: 'from-emerald-500 to-teal-500',
    components: [
      {
        type: 'ai-copilot',
        props: { greeting: 'Welcome to PolyLingo Support! How can I assist you today?', model: 'gpt-4', personality: 'helpful' },
        position: { x: 30, y: 30 },
      },
      {
        type: 'language-selection',
        props: { languages: ['en', 'es', 'fr', 'de'], defaultLanguage: 'en' },
        position: { x: 30, y: 190 },
      },
      {
        type: 'voice-output',
        props: { voice: 'elevenlabs-clara', text: 'Thank you for reaching out to support. We are online 24/7!' },
        position: { x: 30, y: 310 },
      },
    ],
  },
  {
    id: 'language-learning-coach',
    title: 'Language Learning Coach',
    category: 'Education & Practice',
    description: 'Interactive conversation practice tool with real-time translation and ElevenLabs voice pronunciation.',
    icon: Globe,
    gradient: 'from-purple-500 to-pink-500',
    components: [
      {
        type: 'chat-interface',
        props: { title: 'Conversación en Español', initialMessage: '¡Hola! Vamos a practicar español hoy.', theme: 'light' },
        position: { x: 30, y: 30 },
      },
      {
        type: 'voice-output',
        props: { voice: 'elevenlabs-james', text: '¡Excelente pronunciación! Sigue practicando todos los días.' },
        position: { x: 30, y: 360 },
      },
    ],
  },
  {
    id: 'creative-marketing-studio',
    title: 'Creative Marketing Studio',
    category: 'Content Generation',
    description: 'AI-powered image generator and text synthesizer app for marketing and promotional content.',
    icon: Wand2,
    gradient: 'from-amber-500 to-orange-500',
    components: [
      {
        type: 'image-generator',
        props: { promptLabel: 'Describe the promotional asset you want to generate...', buttonText: 'Create Visual' },
        position: { x: 30, y: 30 },
      },
      {
        type: 'analytics',
        props: { title: 'Asset Generation Usage', metric: 'views', chartType: 'bar' },
        position: { x: 30, y: 320 },
      },
    ],
  },
  {
    id: 'voice-synthesis-kiosk',
    title: 'Multilingual Voice Kiosk',
    category: 'Accessibility & Audio',
    description: 'High-speed text-to-speech kiosk app supporting custom ElevenLabs voices and instant translation.',
    icon: Mic,
    gradient: 'from-blue-500 to-cyan-500',
    components: [
      {
        type: 'text-input',
        props: { label: 'Input Text for Synthesis', placeholder: 'Enter announcement text...' },
        position: { x: 30, y: 30 },
      },
      {
        type: 'language-selection',
        props: { languages: ['en', 'es', 'fr', 'ja'], defaultLanguage: 'en' },
        position: { x: 30, y: 150 },
      },
      {
        type: 'voice-output',
        props: { voice: 'elevenlabs-clara', text: 'Broadcast ready.' },
        position: { x: 30, y: 280 },
      },
    ],
  },
];

const TemplateLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { createNewApp } = useAppBuilder();
  const navigate = useNavigate();
  const toast = useToast();

  const handleUseTemplate = (template: TemplateItem) => {
    if (!user) {
      toast.info('Please sign in to save templates to your workspace.', 'Sign In Required');
      navigate('/auth');
      return;
    }

    createNewApp(template.components);
    toast.success(`Loaded "${template.title}" template into builder!`, 'Template Loaded');
    navigate('/builder/new', { state: { preserveCurrentApp: true } });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Navigation Header */}
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
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Ready-To-Use Starter Blueprints
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            App Template Library
          </h1>
          <p className="text-slate-400 text-base">
            Kickstart your application with pre-configured component layouts, ElevenLabs voice settings, and AI prompts.
          </p>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((template) => {
            const IconComponent = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${template.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {template.description}
                  </p>

                  <div className="space-y-2 mb-8">
                    <div className="text-xs font-semibold text-slate-300 mb-2">Included Components:</div>
                    {template.components.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="capitalize">{comp.type.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>Use This Template</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TemplateLibraryPage;
