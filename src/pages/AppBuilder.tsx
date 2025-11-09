import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Save, 
  Settings, 
  Eye,
  Upload,
  ArrowLeft,
  Bot,
  Palette,
  Languages,
  Volume2,
  Sparkles
} from 'lucide-react';
import { useAppBuilder } from '../contexts/AppBuilderContext';
import DroppableCanvas from '../components/DroppableCanvas';
import ComponentLibrary from '../components/ComponentLibrary';
import AppPreview from '../components/AppPreview';
import { useAuth } from '../contexts/AuthContext';

const AppBuilder = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentApp, loadApp, saveApp, publishApp, createNewApp } = useAppBuilder();
  const [activeTab, setActiveTab] = useState<'components' | 'settings' | 'preview'>('components');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (appId && appId !== 'new') {
      loadApp(appId);
    } else if (appId === 'new' || !appId) {
      createNewApp();
    }
  }, [appId, loadApp, createNewApp]);

  const handleSave = () => {
    if (currentApp) {
      saveApp(currentApp);
    }
  };

  const handlePublish = async () => {
    if (!currentApp) return;
    
    if (user?.plan === 'free' && !user) {
      alert('Please upgrade to Pro to publish your apps!');
      return;
    }

    setIsPublishing(true);
    try {
      const url = await publishApp(currentApp.id);
      setPublishedUrl(url);
    } catch (error) {
      console.error('Failed to publish app:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentApp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="nav-glass border-b border-white/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentApp.title}
              </h1>
              <p className="text-sm text-gray-600">
                Last saved: {new Date(currentApp.updated_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="btn-secondary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <button
              onClick={() => setActiveTab('preview')}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="btn-primary flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 sidebar-glass flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-white/20">
            {[
              { id: 'components', label: 'Components', icon: Bot },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'components' && <ComponentLibrary />}
            {activeTab === 'settings' && (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    App Title
                  </label>
                  <input
                    type="text"
                    value={currentApp.title}
                    onChange={(e) => {
                      const updatedApp = { ...currentApp, title: e.target.value };
                      saveApp(updatedApp);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    value={currentApp.description}
                    onChange={(e) => {
                      const updatedApp = { ...currentApp, description: e.target.value };
                      saveApp(updatedApp);
                    }}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={currentApp.settings.primaryColor}
                    onChange={(e) => {
                      const updatedApp = {
                        ...currentApp,
                        settings: { ...currentApp.settings, primaryColor: e.target.value }
                      };
                      saveApp(updatedApp);
                    }}
                    className="w-20 h-12 border border-gray-300 rounded-xl cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Languages className="w-4 h-4 inline mr-2" />
                    Default Language
                  </label>
                  <select
                    value={currentApp.settings.language}
                    onChange={(e) => {
                      const updatedApp = {
                        ...currentApp,
                        settings: { ...currentApp.settings, language: e.target.value }
                      };
                      saveApp(updatedApp);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Volume2 className="w-4 h-4 inline mr-2" />
                    Voice Setting
                  </label>
                  <select
                    value={currentApp.settings.voice}
                    onChange={(e) => {
                      const updatedApp = {
                        ...currentApp,
                        settings: { ...currentApp.settings, voice: e.target.value }
                      };
                      saveApp(updatedApp);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="default">Default Voice</option>
                    <option value="elevenlabs-clara">ElevenLabs - Clara</option>
                    <option value="elevenlabs-james">ElevenLabs - James</option>
                    <option value="custom">Custom Voice</option>
                  </select>
                </div>
              </div>
            )}
            {activeTab === 'preview' && <AppPreview app={currentApp} />}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-8">
          <DroppableCanvas app={currentApp} />
        </div>
      </div>

      {/* Publish Success Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="app-card p-10 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                App Published Successfully!
              </h3>
              <p className="text-gray-600 mb-8">
                Your app is now live and accessible at:
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-8">
                <code className="text-sm text-emerald-600 break-all font-medium">{publishedUrl}</code>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => window.open(publishedUrl, '_blank')}
                  className="btn-primary flex-1"
                >
                  Visit App
                </button>
                <button
                  onClick={() => setPublishedUrl(null)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppBuilder;