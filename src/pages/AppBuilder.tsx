import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  Settings,
  Eye,
  Upload,
  ArrowLeft,
  Bot,
  Sparkles,
  Download,
  Undo2,
  Redo2
} from 'lucide-react';
import { useAppBuilder } from '../contexts/AppBuilderContext';
import DroppableCanvas from '../components/DroppableCanvas';
import ComponentLibrary from '../components/ComponentLibrary';
import AppPreview from '../components/AppPreview';
import AppSettings from '../components/AppSettings';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { useToast } from '../contexts/ToastContext';

const AppBuilder = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    currentApp,
    loadApp,
    saveApp,
    publishApp,
    createNewApp,
    exportApp,
    undo,
    redo,
    canUndo,
    canRedo
  } = useAppBuilder();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'components' | 'settings' | 'preview'>('components');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const initializedRoute = useRef<string | undefined | null>(null);

  useEffect(() => {
    if (initializedRoute.current === appId) return;
    initializedRoute.current = appId;

    if (appId && appId !== 'new') {
      loadApp(appId);
    } else if (appId === 'new' || !appId) {
      if (!(location.state as { preserveCurrentApp?: boolean } | null)?.preserveCurrentApp) {
        createNewApp();
      }
    }
  }, [appId, loadApp, createNewApp, location.state]);

  const handleSave = useCallback(async () => {
    if (!currentApp) return;
    setIsSaving(true);
    try {
      await saveApp(currentApp);
      toast.success('App changes saved successfully.', 'Saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save app changes.', 'Save Error');
    } finally {
      setIsSaving(false);
    }
  }, [currentApp, saveApp, toast]);

  // Keyboard shortcut listener (Ctrl+Z: Undo, Ctrl+Y / Cmd+Shift+Z: Redo, Ctrl+S: Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      if (e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            redo();
            toast.info('Redone component action', 'Redo');
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            undo();
            toast.info('Undone component action', 'Undo');
          }
        }
      } else if (e.key.toLowerCase() === 'y') {
        if (canRedo) {
          e.preventDefault();
          redo();
          toast.info('Redone component action', 'Redo');
        }
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, handleSave, toast]);

  const handleExport = () => {
    if (currentApp) {
      exportApp(currentApp);
      toast.success(`Exported ${currentApp.title} JSON configuration.`, 'Exported');
    }
  };

  const handlePublish = async () => {
    if (!currentApp) return;

    if (!user) {
      toast.error('Please log in to publish your app.', 'Authentication Required');
      return;
    }

    setIsPublishing(true);
    try {
      const url = await publishApp(currentApp.id);
      setPublishedUrl(url);
      toast.success('App successfully published to live URL!', 'Published');
    } catch (error) {
      console.error('Failed to publish app:', error);
      toast.error('Failed to publish app. Please try again.', 'Publish Error');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentApp) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400 text-xs font-medium">Loading App Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-1/3 left-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Top Bar Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
            </button>

            <div>
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
                {currentApp.title} <Sparkles className="w-4 h-4 text-emerald-400" />
              </h1>
              <p className="text-xs text-slate-400">
                Last saved: {new Date(currentApp.updated_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Undo / Redo Toolbar Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              {isSaving ? 'Saving…' : 'Save'}
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              Preview
            </button>

            <div className="flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-0.5">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border-r border-slate-800"
                title="Download JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-950"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <div className="w-80 bg-slate-900/90 border-r border-slate-800 backdrop-blur-xl flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60">
            {[
              { id: 'components', label: 'Components', icon: Bot },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-3 py-3.5 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-900/90'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {activeTab === 'components' && <ComponentLibrary />}
            {activeTab === 'settings' && (
              <div className="p-6 space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Configuring app settings & theme in main workspace.</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">Settings Sections</h4>
                  <div className="space-y-2 text-slate-400">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" /> Basic Metadata
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" /> Brand Color Palette
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-purple-400" /> Voice & Localization
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('components')}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
                >
                  Return to Canvas Editor
                </button>
              </div>
            )}
            {activeTab === 'preview' && (
              <div className="p-6 space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Viewing live interactive preview in main workspace.</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">App Specifications</h4>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Components:</span>
                    <strong className="text-white">{currentApp.components.length}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Default Language:</span>
                    <strong className="text-cyan-400">{(currentApp.settings.language || 'en').toUpperCase()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Voice Model:</span>
                    <strong className="text-purple-400">{currentApp.settings.voice || 'Default'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Status:</span>
                    <strong className="text-emerald-400">{currentApp.published ? 'Published' : 'Draft'}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('components')}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
                >
                  Return to Canvas Editor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas / Preview / Settings Workspace Area */}
        <div className="flex-1 p-6 flex flex-col bg-slate-950 overflow-hidden">
          <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-y-auto relative backdrop-blur-xl">
            <ErrorBoundary title="App Workspace Rendering Error">
              {activeTab === 'preview' ? (
                <AppPreview app={currentApp} />
              ) : activeTab === 'settings' ? (
                <AppSettings />
              ) : (
                <DroppableCanvas />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Published URL Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">App Published!</h3>
              <p className="text-slate-400 text-xs">
                Your application is live and accessible at the following URL:
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-3.5 mb-6 border border-slate-800">
              <input
                type="text"
                value={publishedUrl}
                readOnly
                className="w-full bg-transparent text-xs text-emerald-400 focus:outline-none select-all"
              />
            </div>

            <div className="flex gap-3">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex-1 text-center transition-colors"
              >
                Visit App
              </a>
              <button
                onClick={() => setPublishedUrl(null)}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppBuilder;
