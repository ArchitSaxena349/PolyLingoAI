import React, { useState } from 'react';
import { useAppBuilder } from '../contexts/AppBuilderContext';
import { Palette, Globe, Volume2, Sparkles, Check, Save, ExternalLink, ShieldCheck, Rocket } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const COLOR_SWATCHES = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Royal Blue', hex: '#3B82F6' },
];

const LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'pt', name: 'Portuguese (Português)' },
];

const VOICES = [
  { id: 'default', name: 'Default AI Voice (Multilingual)', provider: 'PolyLingo Native' },
  { id: 'elevenlabs-clara', name: 'Clara - Warm & Friendly', provider: 'ElevenLabs' },
  { id: 'elevenlabs-james', name: 'James - Professional & Deep', provider: 'ElevenLabs' },
  { id: 'tavus-avatar', name: 'Tavus Conversational Video AI', provider: 'Tavus' },
];

const AppSettings: React.FC = () => {
  const { currentApp, saveApp, publishApp } = useAppBuilder();
  const toast = useToast();

  const [title, setTitle] = useState(currentApp?.title || '');
  const [description, setDescription] = useState(currentApp?.description || '');
  const [primaryColor, setPrimaryColor] = useState(currentApp?.settings?.primaryColor || '#10B981');
  const [language, setLanguage] = useState(currentApp?.settings?.language || 'en');
  const [voice, setVoice] = useState(currentApp?.settings?.voice || 'default');
  const [isPublishing, setIsPublishing] = useState(false);

  if (!currentApp) return null;

  const handleSave = async () => {
    await saveApp({
      ...currentApp,
      title: title.trim() || 'Untitled App',
      description: description.trim(),
      settings: {
        ...currentApp.settings,
        primaryColor,
        language,
        voice,
      },
    });
    toast.success('App settings saved successfully!');
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await handleSave();
      const url = await publishApp(currentApp.id);
      toast.success(`App published successfully! Live at ${url}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish application.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" /> App Configuration & Settings
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Manage branding, localization, AI voice engines, and deployment parameters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-emerald-400" /> Save Settings
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Rocket className="w-4 h-4" /> {isPublishing ? 'Publishing...' : 'Publish App'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form Controls (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* General Metadata */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Basic Metadata
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">App Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter app name..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your app does..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Primary Color & Theme */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" /> Brand & Accent Color
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setPrimaryColor(swatch.hex)}
                  className={`h-11 rounded-xl flex items-center justify-center transition-all border ${
                    primaryColor === swatch.hex
                      ? 'ring-2 ring-emerald-400 border-white scale-105 shadow-lg'
                      : 'border-slate-800 hover:scale-102'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.name}
                >
                  {primaryColor === swatch.hex && <Check className="w-4 h-4 text-slate-950 font-bold" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs font-semibold text-slate-400">Custom Color:</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-8 rounded-lg border border-slate-800 bg-slate-950 p-0.5 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-white uppercase">{primaryColor}</span>
            </div>
          </div>

          {/* Localization & Voice Engine */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" /> Default Language
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" /> Default AI Voice Engine
              </h3>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live App Card Preview & Deployment Info (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Live Brand Card Preview
            </h3>

            <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
              <div className="p-4 text-white" style={{ backgroundColor: primaryColor }}>
                <h4 className="font-extrabold text-sm truncate">{title || 'Untitled App'}</h4>
                <p className="text-xs opacity-90 line-clamp-2 mt-1">{description || 'No description provided.'}</p>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Language:</span>
                  <strong className="text-white">{language.toUpperCase()}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Voice Engine:</span>
                  <strong className="text-purple-400 truncate max-w-[120px]">{voice}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Deployment Info
            </h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className={`font-bold ${currentApp.published ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentApp.published ? 'Published' : 'Draft'}
                </span>
              </div>
              {currentApp.published_url && (
                <a
                  href={currentApp.published_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-2 inline-flex"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Deployed App
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
