import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Mic,
  Globe,
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Volume2,
  MessageSquare,
  Cpu,
  ShieldCheck,
  LayoutDashboard,
  Wand2,
  ChevronRight,
  Star,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeDemoTab, setActiveDemoTab] = useState<'chatbot' | 'voice' | 'translate'>('chatbot');
  
  // Interactive Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; sender: 'bot' | 'user'; text: string }>>([
    { id: 1, sender: 'bot', text: 'Hello! Welcome to PolyLingo AI. Try typing a message or question below to test me live!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Interactive Voice State
  const [demoVoiceText, setDemoVoiceText] = useState('Welcome to PolyLingo AI! Build voice synthesis workflows without code.');
  const [demoVoicePlaying, setDemoVoicePlaying] = useState(false);

  // Interactive Translation State
  const [translationInput, setTranslationInput] = useState('Hello! Welcome to PolyLingo AI.');
  const [selectedLang, setSelectedLang] = useState<'es' | 'fr' | 'de' | 'ja' | 'it'>('es');
  const [demoTranslation, setDemoTranslation] = useState('¡Hola! Bienvenido a PolyLingo AI.');

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isBotThinking) return;

    const userMsg = chatInput.trim();
    const newMsgId = Date.now();

    setChatMessages(prev => [...prev, { id: newMsgId, sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsBotThinking(true);

    setTimeout(() => {
      let reply = `PolyLingo AI allows you to construct visual workflows for "${userMsg}"! Connect custom prompts, voice models, and translation engines effortlessly.`;
      const lower = userMsg.toLowerCase();
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = 'Hello! Ready to build? Click "Launch App Builder Free" above to start dragging components onto your canvas!';
      } else if (lower.includes('voice') || lower.includes('audio') || lower.includes('elevenlabs')) {
        reply = 'Our ElevenLabs integration allows you to generate ultra-realistic voice outputs and clone custom voices in minutes!';
      } else if (lower.includes('translate') || lower.includes('language') || lower.includes('lingo')) {
        reply = 'PolyLingo AI supports real-time neural translation across 50+ languages with zero API configuration needed.';
      }

      setChatMessages(prev => [...prev, { id: newMsgId + 1, sender: 'bot', text: reply }]);
      setIsBotThinking(false);
    }, 900);
  };

  const handlePlayVoice = () => {
    if (demoVoicePlaying) return;
    setDemoVoicePlaying(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(demoVoiceText || 'Welcome to PolyLingo AI!');
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setDemoVoicePlaying(false);
      utterance.onerror = () => setDemoVoicePlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setDemoVoicePlaying(false), 2500);
    }
  };

  const updateTranslation = (text: string, lang: 'es' | 'fr' | 'de' | 'ja' | 'it') => {
    setSelectedLang(lang);
    if (!text.trim()) {
      setDemoTranslation('');
      return;
    }

    const cleanText = text.trim();
    const normalized = cleanText.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

    // Precise Phrase Mappings
    const phraseMap: Record<string, Record<string, string>> = {
      'hello welcome to polylingo ai': {
        es: '¡Hola! Bienvenido a PolyLingo AI.',
        fr: 'Bonjour ! Bienvenue sur PolyLingo AI.',
        de: 'Hallo! Willkommen bei PolyLingo AI.',
        ja: 'こんにちは！PolyLingo AIへようこそ。',
        it: 'Ciao! Benvenuto in PolyLingo AI.'
      },
      'hey hii how are you': {
        es: '¡Hola! ¿Cómo estás?',
        fr: 'Bonjour ! Comment allez-vous ?',
        de: 'Hallo! Wie geht es dir?',
        ja: 'こんにちは！お元気ですか？',
        it: 'Ciao! Come stai?'
      },
      'hi how are you': {
        es: '¡Hola! ¿Cómo estás?',
        fr: 'Bonjour ! Comment allez-vous ?',
        de: 'Hallo! Wie geht es dir?',
        ja: 'こんにちは！お元気ですか？',
        it: 'Ciao! Come stai?'
      },
      'hello how are you': {
        es: '¡Hola! ¿Cómo estás?',
        fr: 'Bonjour ! Comment allez-vous ?',
        de: 'Hallo! Wie geht es dir?',
        ja: 'こんにちは！お元気ですか？',
        it: 'Ciao! Come stai?'
      },
      'how are you': {
        es: '¿Cómo estás?',
        fr: 'Comment allez-vous ?',
        de: 'Wie geht es Ihnen?',
        ja: 'お元気ですか？',
        it: 'Come stai?'
      },
      'hello': {
        es: '¡Hola!',
        fr: 'Bonjour !',
        de: 'Hallo!',
        ja: 'こんにちは！',
        it: 'Ciao!'
      },
      'hi': {
        es: '¡Hola!',
        fr: 'Salut !',
        de: 'Hallo!',
        ja: 'やあ！',
        it: 'Ciao!'
      },
      'hey': {
        es: '¡Hola!',
        fr: 'Hey !',
        de: 'Hallo!',
        ja: 'やあ！',
        it: 'Ehi!'
      },
      'thank you': {
        es: '¡Muchas gracias!',
        fr: 'Merci beaucoup !',
        de: 'Vielen Dank!',
        ja: 'ありがとうございます！',
        it: 'Grazie mille!'
      },
      'thanks': {
        es: '¡Gracias!',
        fr: 'Merci !',
        de: 'Danke!',
        ja: 'ありがとう！',
        it: 'Grazie!'
      },
      'good morning': {
        es: '¡Buenos días!',
        fr: 'Bonjour !',
        de: 'Guten Morgen!',
        ja: 'おはようございます！',
        it: 'Buongiorno!'
      },
      'what is your name': {
        es: '¿Cómo te llamas?',
        fr: 'Comment vous appelez-vous ?',
        de: 'Wie heißen Sie?',
        ja: 'お名前は何ですか？',
        it: 'Come ti chiami?'
      },
      'goodbye': {
        es: '¡Hasta luego!',
        fr: 'Au revoir !',
        de: 'Auf Wiedersehen!',
        ja: 'さようなら！',
        it: 'Arrivederci!'
      }
    };

    if (phraseMap[normalized] && phraseMap[normalized][lang]) {
      setDemoTranslation(phraseMap[normalized][lang]);
      return;
    }

    // Word Dictionary Fallback Translator for arbitrary sentences
    const wordDict: Record<string, Record<string, string>> = {
      es: {
        hey: 'hola', hii: 'hola', hi: 'hola', hello: 'hola',
        how: 'cómo', are: 'estás', you: 'tú', good: 'bueno',
        fine: 'bien', great: 'genial', morning: 'días',
        night: 'noche', name: 'nombre', what: 'qué', is: 'es'
      },
      fr: {
        hey: 'bonjour', hii: 'salut', hi: 'salut', hello: 'bonjour',
        how: 'comment', are: 'allez', you: 'vous', good: 'bon',
        fine: 'bien', great: 'super', morning: 'matin',
        night: 'nuit', name: 'nom', what: 'quel', is: 'est'
      },
      de: {
        hey: 'hallo', hii: 'hallo', hi: 'hallo', hello: 'hallo',
        how: 'wie', are: 'geht', you: 'dir', good: 'gut',
        fine: 'gut', great: 'super', morning: 'morgen',
        night: 'nacht', name: 'name', what: 'was', is: 'ist'
      },
      ja: {
        hey: 'こんにちは', hii: 'こんにちは', hi: 'やあ', hello: 'こんにちは',
        how: 'いかが', are: 'ですか', you: 'あなた', good: '良い',
        fine: '元気', great: '素晴らしい', morning: '朝',
        night: '夜', name: '名前', what: '何', is: 'ですか'
      },
      it: {
        hey: 'ciao', hii: 'ciao', hi: 'ciao', hello: 'ciao',
        how: 'come', are: 'stai', you: 'tu', good: 'buono',
        fine: 'bene', great: 'ottimo', morning: 'giorno',
        night: 'notte', name: 'nome', what: 'cosa', is: 'è'
      }
    };

    const targetDict = wordDict[lang] || {};
    const translatedWords = cleanText.split(/\s+/).map(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      return targetDict[cleanWord] || word;
    });

    const langNames: Record<string, string> = {
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      ja: '日本語',
      it: 'Italiano'
    };

    const translatedSentence = translatedWords.join(' ');
    setDemoTranslation(`${translatedSentence} (${langNames[lang]})`);
  };

  const features = [
    {
      icon: Bot,
      title: 'Visual Chatbot Studio',
      description: 'Design conversational AI assistants with custom personalities, fallback logic, and context awareness.',
      badge: 'NLP Engine',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Mic,
      title: 'ElevenLabs Voice Cloning',
      description: 'Synthesize life-like audio output and clone custom voices directly into your AI workflows.',
      badge: 'Voice AI',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Globe,
      title: ' Instant 50+ Language Translation',
      description: 'Break global barriers with real-time automatic translation powered by neural Lingo APIs.',
      badge: 'Localization',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Drag & Drop Canvas',
      description: 'Assemble rich user interfaces with zero code required. Move, resize, and connect components seamlessly.',
      badge: 'Visual Builder',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security & RLS',
      description: 'Powered by Supabase PostgreSQL with strict Row Level Security to protect user data.',
      badge: 'Production Ready',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Smartphone,
      title: '1-Click Web & Mobile Export',
      description: 'Export ready-to-deploy React and Netlify site configurations instantly with custom domains.',
      badge: 'Deployment',
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Drag Components',
      description: 'Choose from text inputs, voice synthesizers, chatbot frames, and image generators from our component library.',
      icon: Layers,
    },
    {
      step: '02',
      title: 'Configure AI Logic',
      description: 'Set custom system prompts, select primary languages, and assign ElevenLabs voice models with zero code.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Publish Live Instantly',
      description: 'Hit Publish to deploy your responsive app to live web URLs and mobile-ready endpoints instantly.',
      icon: Sparkles,
    },
  ];

  const stats = [
    { value: '10,000+', label: 'AI Apps Built' },
    { value: '50+', label: 'Languages Supported' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '0 Line', label: 'Code Required' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Head of Product',
      company: 'OmniGlobal Inc.',
      content: 'PolyLingo AI revolutionized our customer onboarding. We created support bots in 6 languages in under an hour!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=128&h=128&fit=crop&crop=face',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'Lead Architect',
      company: 'NextGen Solutions',
      content: 'The ElevenLabs integration and visual drag-and-drop canvas make rapid prototyping ridiculously fast.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Growth Specialist',
      company: 'EduSpeak AI',
      content: 'We scaled our interactive language tutor app to thousands of students globally with zero server overhead.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Glow Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PolyLingo AI
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                Features
              </a>
              <a href="#demo" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                Live Simulator
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                Testimonials
              </a>
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/auth"
                    className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-8 shadow-inner"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>Next-Gen Visual AI App Builder</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.15] mb-8"
            >
              Build & Deploy <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Multilingual AI Applications
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
            >
              Create intelligent chatbots, voice synthesis engines, and real-time multi-language translators visually. No coding required.
            </motion.p>

            {/* Hero Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Launch App Builder Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}

              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base rounded-2xl border border-slate-700/80 flex items-center justify-center gap-3 transition-all"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                Try Interactive Demo
              </a>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Interactive Simulator Section */}
      <section id="demo" className="relative z-10 py-20 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
              <Wand2 className="w-3.5 h-3.5" />
              Live Hands-On Playground
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Test AI Components Right Here
            </h2>
            <p className="text-slate-400 text-base">
              Experience the core building blocks of PolyLingo AI before launching your workspace.
            </p>
          </div>

          {/* Playground Card Container */}
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Playground Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
              <button
                onClick={() => setActiveDemoTab('chatbot')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeDemoTab === 'chatbot'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                AI Copilot
              </button>

              <button
                onClick={() => setActiveDemoTab('voice')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeDemoTab === 'voice'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                ElevenLabs Voice
              </button>

              <button
                onClick={() => setActiveDemoTab('translate')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeDemoTab === 'translate'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Globe className="w-4 h-4" />
                Lingo Translation
              </button>
            </div>

            {/* Playground Content Area */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeDemoTab === 'chatbot' && (
                  <motion.div
                    key="chatbot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[300px] overflow-y-auto">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">PolyLingo AI Copilot</p>
                          <p className="text-[10px] text-emerald-400">Online • GPT-4 Engine</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                              msg.sender === 'bot'
                                ? 'bg-slate-800/80 text-slate-200 border border-slate-700/60 mr-auto'
                                : 'bg-emerald-500/20 text-emerald-300 ml-auto text-right border border-emerald-500/30'
                            }`}
                          >
                            {msg.text}
                          </div>
                        ))}

                        {isBotThinking && (
                          <div className="bg-slate-800/80 text-slate-400 p-3 rounded-xl text-xs max-w-[85%] flex items-center gap-2 border border-slate-700/60">
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-emerald-400"></div>
                            <span>PolyLingo Assistant is generating a response...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSendChatMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask anything (e.g., 'How does voice cloning work?')..."
                        className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={isBotThinking || !chatInput.trim()}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        Send Message
                      </button>
                    </form>
                  </motion.div>
                )}

                {activeDemoTab === 'voice' && (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                      <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
                        <Mic className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1">Clara (ElevenLabs Custom Voice)</h4>
                        <p className="text-xs text-slate-400">Model: eleven_monolingual_v1 • Web Audio TTS Engine</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-400 text-left">Custom Input Text for Speech</label>
                        <input
                          type="text"
                          value={demoVoiceText}
                          onChange={(e) => setDemoVoiceText(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <button
                        onClick={handlePlayVoice}
                        className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 mx-auto"
                      >
                        {demoVoicePlaying ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Speaking Audio...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            Play Real Audio Output
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeDemoTab === 'translate' && (
                  <motion.div
                    key="translate"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <label className="block text-xs font-semibold text-slate-400 mb-2">English (Source Text)</label>
                        <textarea
                          value={translationInput}
                          onChange={(e) => {
                            setTranslationInput(e.target.value);
                            updateTranslation(e.target.value, selectedLang);
                          }}
                          rows={3}
                          placeholder="Type text to translate..."
                          className="w-full bg-transparent text-xs text-white focus:outline-none resize-none"
                        />
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30">
                        <label className="block text-xs font-semibold text-emerald-400 mb-2">Translation Result</label>
                        <p className="text-xs text-white font-medium min-h-[60px] leading-relaxed">
                          {demoTranslation || <span className="text-slate-600 italic">Translation will appear here...</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs text-slate-400 mr-2">Target Language:</span>
                      {[
                        { code: 'es', name: 'Spanish' },
                        { code: 'fr', name: 'French' },
                        { code: 'de', name: 'German' },
                        { code: 'ja', name: 'Japanese' },
                        { code: 'it', name: 'Italian' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => updateTranslation(translationInput, lang.code as any)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedLang === lang.code
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Showcase */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
              Everything You Need to Build <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Production-Grade AI Apps
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              Engineered with modern architecture to turn complex AI integrations into drag-and-drop simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="how-it-works" className="relative z-10 py-24 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              Simplified Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              From Idea to Published App in 3 Steps
            </h2>
            <p className="text-slate-400 text-base">
              No complicated API keys or server setup required. Build visually from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative group">
                <div className="text-4xl font-extrabold text-emerald-500/30 mb-4">{step.step}</div>
                <div className="w-12 h-12 bg-slate-800 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Loved by Creators & Builders
            </h2>
            <p className="text-slate-400 text-base">
              Here is what developers, founders, and product teams are saying about PolyLingo AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-6">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                    "{item.content}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.role}, {item.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-slate-950">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">
            Ready to Build Your AI App Today?
          </h2>
          <p className="text-lg sm:text-xl font-medium text-slate-900 max-w-2xl mx-auto mb-10">
            Join thousands of developers and creators building next-generation multilingual AI applications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-10 py-4 bg-slate-950 hover:bg-slate-900 text-white font-bold text-base rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="w-full sm:w-auto px-10 py-4 bg-slate-950 hover:bg-slate-900 text-white font-bold text-base rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all"
              >
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Start Building Free Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-800 text-slate-400 py-16 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-white">PolyLingo AI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                The visual AI application builder platform. Create chatbots, voice synths, and translators without code.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>All Systems Operational</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Product</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Live Simulator</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a></li>
                <li><Link to="/setup" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Resources</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/setup" className="hover:text-white transition-colors">Setup Guide</Link></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Customer Stories</a></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Connect</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="mailto:support@polylingo.ai" className="hover:text-white transition-colors">Support Email</a></li>
                <li><a href="https://github.com/ArchitSaxena349/PolyLingoAI" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
                <li>
                  <Link
                    to={user ? "/dashboard" : "/auth"}
                    state={{ defaultTab: 'community' }}
                    className="hover:text-white transition-colors"
                  >
                    Community Hub
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} PolyLingo AI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-slate-400">Terms</Link>
              <Link to="/privacy" className="hover:text-slate-400">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
