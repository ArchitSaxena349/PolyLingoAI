import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Mic,
  Globe,
  Type,
  MessageSquare,
  Settings,
  Trash2,
  Move,
  Play,
  Pause,
  Image as ImageIcon,
  Hand,
  Box,
  Video,
  BarChart,
  Sparkles,
  Copy,
  Send,
  CheckCircle2
} from 'lucide-react';
import { AppComponent } from '../contexts/AppBuilderContext';
import { useToast } from '../contexts/ToastContext';

interface AppComponentRendererProps {
  component: AppComponent;
  onUpdate: (updates: Partial<AppComponent>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  isGridMode?: boolean;
}

const AppComponentRenderer: React.FC<AppComponentRendererProps> = ({
  component,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Interactive local states for canvas preview
  const [inputValue, setInputValue] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: component.props.initialMessage || component.props.greeting || 'Hello! How can I help you today?' }
  ]);

  const handleSpeak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      toast.info('Text-to-speech preview is simulated.');
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak || 'Hello from PolyLingo AI');
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'ai', text: `AI response for: "${msg}"` }]);
    }, 500);
  };

  const getIcon = () => {
    switch (component.type) {
      case 'text-input': return Type;
      case 'voice-output': return Mic;
      case 'language-selection': return Globe;
      case 'ai-copilot': return Bot;
      case 'image': return ImageIcon;
      case 'button': return Hand;
      case 'container': return Box;
      case 'video-player': return Video;
      case 'chat-interface': return MessageSquare;
      case 'image-generator': return Sparkles;
      case 'analytics': return BarChart;
      case 'custom': return Sparkles;
      default: return MessageSquare;
    }
  };

  const getTitle = () => {
    switch (component.type) {
      case 'text-input': return 'Text Input';
      case 'voice-output': return 'Voice Output';
      case 'language-selection': return 'Language Selector';
      case 'ai-copilot': return 'AI Copilot';
      case 'image': return 'Image Display';
      case 'button': return 'Action Button';
      case 'container': return 'Container';
      case 'video-player': return 'Video Player';
      case 'chat-interface': return 'Chat Interface';
      case 'image-generator': return 'Image Generator';
      case 'analytics': return 'Analytics Dashboard';
      case 'custom': return 'AI Component';
      default: return 'Component';
    }
  };

  const renderComponentContent = () => {
    switch (component.type) {
      case 'text-input':
        return (
          <div className="space-y-2">
            {component.props.label && (
              <label className="block text-xs font-bold text-slate-300">
                {component.props.label}
              </label>
            )}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={component.props.placeholder || 'Enter text...'}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        );

      case 'voice-output':
        return (
          <div className="space-y-3 p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">Voice Output</span>
              <button
                onClick={() => handleSpeak(component.props.text || 'Hello! How can I help you today?')}
                className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Stop' : 'Listen'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-200">
                {component.props.text || 'Hello! How can I help you today?'}
              </p>
            </div>
            <div className="text-[10px] text-purple-400 font-semibold flex items-center justify-between">
              <span>Voice: {component.props.voice || 'Default'}</span>
              <span className="text-slate-500">Multilingual TTS</span>
            </div>
          </div>
        );

      case 'language-selection':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Select Language
            </label>
            <select
              defaultValue={component.props.defaultLanguage || 'en'}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {(component.props.languages || ['en', 'es', 'fr', 'de']).map((lang: string) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        );

      case 'ai-copilot':
        return (
          <div className="space-y-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-emerald-300">AI Copilot</span>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500/20 text-emerald-200 ml-auto max-w-[85%]'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 max-w-[90%]'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask AI..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendChat}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={component.props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
              alt={component.props.alt || 'Component Graphic'}
              className="w-full h-40 rounded-xl object-cover border border-slate-800 shadow-md"
            />
          </div>
        );

      case 'button': {
        const btnClass = component.props.variant === 'secondary'
          ? 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20';

        return (
          <button
            onClick={() => toast.success(`Button "${component.props.label || 'Action'}" clicked!`)}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all ${btnClass}`}
          >
            {component.props.label || 'Click Me'}
          </button>
        );
      }

      case 'container':
        return (
          <div
            className="w-full border-2 border-dashed border-slate-800 min-h-[90px] p-4 flex flex-col items-center justify-center text-slate-400 text-xs rounded-xl bg-slate-950/60"
          >
            <Box className="w-5 h-5 mb-1 text-slate-600" />
            <span>Container Layout Box</span>
          </div>
        );

      case 'video-player':
        return (
          <div className="aspect-video bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="text-slate-400 text-center p-3">
              <Video className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-xs font-bold text-slate-200">Video Player Container</p>
              <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[200px]">
                {component.props.src || 'Embedded Media Player'}
              </p>
            </div>
          </div>
        );

      case 'chat-interface':
        return (
          <div className="w-full border border-slate-800 rounded-xl overflow-hidden flex flex-col bg-slate-950">
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <h4 className="font-bold text-xs text-white">{component.props.title || 'Chat Support'}</h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-32 overflow-y-auto">
              <div className="max-w-[85%] rounded-xl p-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs">
                {component.props.initialMessage || 'Welcome! How can I help?'}
              </div>
            </div>
          </div>
        );

      case 'image-generator':
        return (
          <div className="space-y-3 p-3.5 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h4 className="font-bold text-xs text-pink-300">AI Image Generator</h4>
            </div>
            <div className="aspect-video bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center p-3">
              <p className="text-xs text-pink-300 font-bold">Interactive Prompt Preview</p>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white">{component.props.title || 'Analytics'}</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Live</span>
            </div>
            <div className="h-24 flex items-end justify-between gap-1 px-1">
              {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                <div key={i} className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t transition-colors border-t border-emerald-400" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Standard component</p>
          </div>
        );
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="group relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl shadow-2xl backdrop-blur-xl w-full text-slate-100 transition-all duration-200"
    >
      {/* Component Header Bar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/90 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold text-white">{getTitle()}</span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-1">
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors"
              title="Duplicate Component"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 border rounded-lg transition-colors ${
              isEditing
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
            }`}
            title="Edit Component Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-slate-950 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 rounded-lg transition-colors"
            title="Delete Component"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="cursor-move p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg" title="Drag to Move">
            <Move className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Component Content */}
      <div className="p-4">
        {renderComponentContent()}
      </div>

      {/* Inline Component Settings Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 p-4 bg-slate-950/95 rounded-b-2xl space-y-3"
          >
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Settings className="w-3.5 h-3.5 text-emerald-400" /> Component Properties
            </h4>

            {component.type === 'text-input' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Label</label>
                  <input
                    type="text"
                    value={component.props.label || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, label: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Placeholder</label>
                  <input
                    type="text"
                    value={component.props.placeholder || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, placeholder: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {component.type === 'voice-output' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Voice Text</label>
                  <textarea
                    value={component.props.text || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, text: e.target.value } })}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Voice Model</label>
                  <select
                    value={component.props.voice || 'default'}
                    onChange={(e) => onUpdate({ props: { ...component.props, voice: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="default">Default Multilingual</option>
                    <option value="elevenlabs-clara">ElevenLabs Clara</option>
                    <option value="elevenlabs-james">ElevenLabs James</option>
                  </select>
                </div>
              </div>
            )}

            {component.type === 'language-selection' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Default Language</label>
                  <select
                    value={component.props.defaultLanguage || 'en'}
                    onChange={(e) => onUpdate({ props: { ...component.props, defaultLanguage: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                    <option value="de">German (DE)</option>
                    <option value="zh">Chinese (ZH)</option>
                    <option value="ja">Japanese (JA)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="ar">Arabic (AR)</option>
                  </select>
                </div>
              </div>
            )}

            {component.type === 'ai-copilot' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Initial Greeting</label>
                  <input
                    type="text"
                    value={component.props.greeting || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, greeting: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">AI Engine Model</label>
                  <select
                    value={component.props.model || 'gpt-4'}
                    onChange={(e) => onUpdate({ props: { ...component.props, model: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="gpt-4">GPT-4 Turbo</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="gemini-1-5-pro">Gemini 1.5 Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Personality</label>
                  <select
                    value={component.props.personality || 'helpful'}
                    onChange={(e) => onUpdate({ props: { ...component.props, personality: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="helpful">Helpful Assistant</option>
                    <option value="creative">Creative & Friendly</option>
                    <option value="concise">Concise & Professional</option>
                    <option value="technical">Technical Expert</option>
                  </select>
                </div>
              </div>
            )}

            {component.type === 'button' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={component.props.label || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, label: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Variant</label>
                  <select
                    value={component.props.variant || 'primary'}
                    onChange={(e) => onUpdate({ props: { ...component.props, variant: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="primary">Primary Gradient</option>
                    <option value="secondary">Secondary Dark</option>
                  </select>
                </div>
              </div>
            )}

            {component.type === 'image' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={component.props.src || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, src: e.target.value } })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={component.props.alt || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, alt: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {component.type === 'container' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Container Padding</label>
                  <input
                    type="text"
                    value={component.props.padding || '16px'}
                    onChange={(e) => onUpdate({ props: { ...component.props, padding: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Background Color</label>
                  <input
                    type="text"
                    value={component.props.background || '#0f172a'}
                    onChange={(e) => onUpdate({ props: { ...component.props, background: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            )}

            {component.type === 'video-player' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Video Source URL</label>
                  <input
                    type="text"
                    value={component.props.src || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, src: e.target.value } })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {component.type === 'chat-interface' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Chat Title</label>
                  <input
                    type="text"
                    value={component.props.title || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, title: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Welcome Message</label>
                  <input
                    type="text"
                    value={component.props.initialMessage || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, initialMessage: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {component.type === 'image-generator' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Prompt Field Label</label>
                  <input
                    type="text"
                    value={component.props.promptLabel || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, promptLabel: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {component.type === 'analytics' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={component.props.title || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, title: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {component.type === 'custom' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">AI Prompt</label>
                  <input
                    type="text"
                    value={component.props.prompt || ''}
                    onChange={(e) => onUpdate({ props: { ...component.props, prompt: e.target.value } })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppComponentRenderer;
