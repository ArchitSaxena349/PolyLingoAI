import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreVertical,
  Bot,
  Mic,
  Globe,
  Smartphone,
  LogOut,
  Settings,
  Users,
  Wand2,
  Sparkles,
  ExternalLink,
  Trash2,
  Copy,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppBuilder } from '../contexts/AppBuilderContext';
import { Menu, Transition } from '@headlessui/react';
import VoiceCloner from '../components/VoiceCloner';
import CommunityEvents from '../components/CommunityEvents';
import AIComponentGenerator from '../components/AIComponentGenerator';

import { useToast } from '../contexts/ToastContext';

const Dashboard: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { apps, createNewApp, duplicateApp, deleteApp, loading } = useAppBuilder();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as { defaultTab?: 'apps' | 'voice' | 'community' | 'ai-tools' } | null)?.defaultTab || 'apps';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [activeTab, setActiveTab] = useState<'apps' | 'voice' | 'community' | 'ai-tools'>(initialTab);
  const [showSettings, setShowSettings] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const openSettings = () => {
    setProfileName(user?.name || '');
    setAvatarUrl(user?.avatar_url || '');
    setShowSettings(true);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({ name: profileName, avatar_url: avatarUrl });
      toast.success('Your profile settings were saved.', 'Settings Updated');
      setShowSettings(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save your settings.', 'Settings Error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateNew = () => {
    toast.info('New untitled application template created.');
    navigate('/builder/new');
  };

  const handleDuplicate = async (appId: string, title: string) => {
    await duplicateApp(appId);
    toast.success(`Duplicated "${title}" successfully.`);
  };

  const handleDelete = async (appId: string, title: string) => {
    await deleteApp(appId);
    toast.info(`Deleted "${title}".`);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch {
      navigate('/auth', { replace: true });
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === 'published') return matchesSearch && app.published;
    if (filterBy === 'draft') return matchesSearch && !app.published;
    return matchesSearch;
  });

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'voice-output': return Mic;
      case 'language-selection': return Globe;
      case 'ai-copilot': return Bot;
      default: return Smartphone;
    }
  };

  const handleVoiceCloned = (voiceId: string, voiceName: string) => {
    toast.success(`Voice "${voiceName}" (ID: ${voiceId.slice(0, 12)}...) cloned successfully!`, 'Voice Ready');
    setActiveTab('apps');
  };

  const handleComponentGenerated = (component: any) => {
    toast.success('AI Component generated successfully! Launching App Builder...', 'AI Generation');
    createNewApp([{
      type: 'custom',
      props: {
        prompt: component?.component?.props?.prompt || 'AI-generated component',
        preview: component?.preview || '',
      },
      position: { x: 40, y: 40 },
    }]);
    navigate('/builder/new', { state: { preserveCurrentApp: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Loading Dashboard Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-1/3 left-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  PolyLingo AI
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={openSettings}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                Settings
              </button>
              
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-emerald-500" />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-slate-950 text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user?.name}</span>
                </Menu.Button>
                
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => void handleSignOut()}
                          className={`${
                            active ? 'bg-slate-800 text-red-400' : 'text-slate-300'
                          } flex items-center w-full px-4 py-2.5 font-medium transition-colors`}
                        >
                          <LogOut className="w-4 h-4 mr-2.5 text-red-400" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 flex items-center gap-2">
              Welcome back, {user?.name}! <Sparkles className="w-6 h-6 text-emerald-400" />
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your visual AI applications, ElevenLabs voice clones, and automated translation workflows.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Create New App
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="mb-8 border-b border-slate-800 pb-4">
          <nav className="flex space-x-3 overflow-x-auto scrollbar-none">
            {[
              { id: 'apps', label: 'My Applications', icon: Smartphone },
              { id: 'voice', label: 'Voice Cloning Studio', icon: Mic },
              { id: 'ai-tools', label: 'AI Generator Studio', icon: Wand2 },
              { id: 'community', label: 'Community & Events', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
        {activeTab === 'apps' && (
          <div className="space-y-8">
              {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium mb-1">Total Applications</div>
                <div className="text-3xl font-extrabold text-white">{apps.length}</div>
              </div>
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium mb-1">Published Apps</div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {apps.filter(a => a.published).length}
                </div>
              </div>
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium mb-1">Draft Apps</div>
                <div className="text-3xl font-extrabold text-cyan-400">
                  {apps.filter(a => !a.published).length}
                </div>
              </div>
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium mb-1">AI Workspace</div>
                <div className="text-3xl font-extrabold text-emerald-400 flex items-center gap-1.5">
                  Unlocked
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {['all', 'published', 'draft'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterBy(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      filterBy === filter
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* App Grid */}
            {filteredApps.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <FolderPlus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Applications Found</h3>
                <p className="text-xs text-slate-400 mb-6">
                  {searchQuery ? 'No apps match your search parameters.' : 'Create your first AI application using our visual drag-and-drop builder.'}
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-400 transition-colors"
                >
                  Create Application
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all group shadow-xl"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          app.published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {app.published ? 'Published' : 'Draft'}
                        </span>

                        <Menu as="div" className="relative">
                          <Menu.Button className="p-1 text-slate-500 hover:text-white rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Menu.Button>
                          <Transition
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 mt-2 w-36 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs focus:outline-none">
                              <Menu.Item
                                as="button"
                                type="button"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  void handleDuplicate(app.id, app.title);
                                }}
                                className="flex items-center w-full px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left font-medium"
                              >
                                <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                Duplicate
                              </Menu.Item>
                              <Menu.Item
                                as="button"
                                type="button"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  void handleDelete(app.id, app.title);
                                }}
                                className="flex items-center w-full px-3 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors text-left font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {app.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-6 min-h-[32px]">
                        {app.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center gap-2 mb-6">
                        {app.components.slice(0, 3).map((comp) => {
                          const IconComp = getComponentIcon(comp.type);
                          return (
                            <div key={comp.id} className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                              <IconComp className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                          );
                        })}
                        {app.components.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-semibold">+{app.components.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                      <Link
                        to={`/builder/${app.id}`}
                        className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <span>Edit in Builder</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {app.published_url && (
                        <a
                          href={app.published_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white underline text-[11px]"
                        >
                          Live Site
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="max-w-3xl mx-auto py-4">
            <VoiceCloner onVoiceCloned={handleVoiceCloned} />
          </div>
        )}

        {activeTab === 'ai-tools' && (
          <div className="max-w-3xl mx-auto py-4">
            <AIComponentGenerator onComponentGenerated={handleComponentGenerated} />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="py-4">
            <CommunityEvents />
          </div>
        )}
      </main>

      {/* Profile Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                Account Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
