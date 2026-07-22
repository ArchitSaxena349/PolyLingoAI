import React, { useState } from 'react';
import { AppTemplate, useAppBuilder } from '../contexts/AppBuilderContext';
import { Bot, Mic, Globe, Smartphone, Image, Video, BarChart3, Sparkles, Send, Play, Pause, CheckCircle2 } from 'lucide-react';

interface AppPreviewProps {
  app?: AppTemplate | null;
}

const AppPreview: React.FC<AppPreviewProps> = ({ app: propApp }) => {
  const { currentApp } = useAppBuilder();
  const app = propApp || currentApp;

  const title = app?.title || 'Untitled App';
  const description = app?.description || '';
  const primaryColor = app?.settings?.primaryColor || '#10B981';
  const language = (app?.settings?.language || 'en').toUpperCase();
  const voice = app?.settings?.voice || 'default';
  const isPublished = Boolean(app?.published);
  const components = app?.components || [];

  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: app?.components.find(c => c.type === 'ai-copilot')?.props?.greeting || 'Hello! How can I assist you today?' }
  ]);

  const handleSendCopilot = () => {
    if (!copilotInput.trim()) return;
    const userMsg = copilotInput.trim();
    setCopilotMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setCopilotInput('');
    setTimeout(() => {
      setCopilotMessages(prev => [...prev, { sender: 'ai', text: `Response from AI Copilot model for: "${userMsg}"` }]);
    }, 600);
  };

  const renderPreviewComponent = (component: any) => {
    switch (component?.type) {
      case 'text-input':
        return (
          <div className="space-y-1.5">
            {component.props?.label && (
              <label className="block text-xs font-bold text-slate-300">
                {component.props.label}
              </label>
            )}
            <input
              type="text"
              placeholder={component.props?.placeholder || 'Enter text...'}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        );

      case 'voice-output':
        return (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300">Voice Output</span>
              </div>
              <button
                onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg transition-colors"
                title={isPlayingVoice ? "Pause voice" : "Play voice"}
              >
                {isPlayingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-300">
              {component.props?.text || 'Voice output will speak this text.'}
            </p>
            <div className="text-[10px] text-purple-400 font-semibold">
              Voice Model: {component.props?.voice || voice}
            </div>
          </div>
        );

      case 'language-selection':
        return (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Select Language
            </label>
            <select className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
              {(component.props?.languages || ['en', 'es', 'fr']).map((lang: string) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        );

      case 'ai-copilot':
        return (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">AI Copilot</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {copilotMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 ml-auto max-w-[85%]'
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
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                placeholder="Ask AI anything..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendCopilot}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center"
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
              src={component.props?.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
              alt={component.props?.alt || 'Preview'}
              className="w-full h-auto rounded-xl border border-slate-800 object-cover"
            />
          </div>
        );

      case 'button':
        return (
          <button className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
            component.props?.variant === 'secondary'
              ? 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
          }`}>
            {component.props?.label || 'Click Me'}
          </button>
        );

      case 'video-player':
        return (
          <div className="p-4 bg-slate-950 border border-slate-800 text-white rounded-xl flex flex-col items-center justify-center min-h-[140px]">
            <Video className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-300">Video Player</p>
          </div>
        );

      case 'chat-interface':
        return (
          <div className="border border-slate-800 rounded-xl p-3 space-y-2 bg-slate-950">
            <div className="font-bold text-xs text-white">{component.props?.title || 'Chat'}</div>
            <div className="bg-slate-900 p-2.5 rounded-lg text-xs text-slate-300 border border-slate-800">
              {component.props?.initialMessage || 'Hello!'}
            </div>
          </div>
        );

      case 'image-generator':
        return (
          <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-center space-y-2">
            <Image className="w-6 h-6 text-pink-400 mx-auto mb-1" />
            <p className="text-xs text-pink-300 font-bold">{component.props?.promptLabel || 'Generate Image'}</p>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-white">{component.props?.title || 'Analytics'}</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Live</span>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
            {component?.type || 'Component'}
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-extrabold text-white mb-1 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Interactive App Preview
        </h3>
        <p className="text-slate-400 text-xs">
          Test live interactions of your generated AI app components
        </p>
      </div>

      {/* Mobile Device Mockup */}
      <div className="max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded-[40px] p-3 shadow-2xl ring-1 ring-slate-800">
        {/* Device Notch */}
        <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-2 border border-slate-800"></div>

        <div className="bg-slate-900 rounded-[28px] overflow-hidden min-h-[580px] border border-slate-800 flex flex-col justify-between">
          {/* App Header Bar */}
          <div>
            <div
              className="p-5 text-white shadow-lg flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div>
                <h1 className="text-base font-extrabold drop-shadow-sm">{title}</h1>
                {description && (
                  <p className="text-xs opacity-90 mt-1 line-clamp-2">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20">
                  {language}
                </span>
                {isPublished && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" /> Live
                  </span>
                )}
              </div>
            </div>

            {/* App Components */}
            <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto scrollbar-none">
              {components.length === 0 ? (
                <div className="text-center py-16">
                  <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-400">
                    Add components from the library to build your live preview.
                  </p>
                </div>
              ) : (
                components.map((component: any) => (
                  <div key={component.id}>
                    {renderPreviewComponent(component)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* App Footer Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Powered by PolyLingo AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPreview;
