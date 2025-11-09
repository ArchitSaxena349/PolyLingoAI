import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreVertical,
  Bot,
  Mic,
  Globe,
  Smartphone,
  Calendar,
  Star,
  Crown,
  LogOut,
  Settings,
  User,
  
  Users,
  Wand2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppBuilder } from '../contexts/AppBuilderContext';
import { Menu, Transition } from '@headlessui/react';
import VoiceCloner from '../components/VoiceCloner';
import CommunityEvents from '../components/CommunityEvents';
import AIComponentGenerator from '../components/AIComponentGenerator';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { apps, createNewApp, loading } = useAppBuilder();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [activeTab, setActiveTab] = useState<'apps' | 'voice' | 'community' | 'ai-tools'>('apps');

  const handleCreateNew = () => {
    createNewApp();
    navigate('/builder');
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
    console.log('Voice cloned:', { voiceId, voiceName });
    // Handle voice cloning success
  };

  const handleComponentGenerated = (component: any) => {
    console.log('Component generated:', component);
    // Handle AI-generated component
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">PolyLingo AI</span>
              </Link>
              
              {user?.plan === 'pro' && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  <Crown className="w-4 h-4" />
                  Pro
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="btn-secondary flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
                </Menu.Button>
                
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 py-2 z-50">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${
                            active ? 'bg-gray-100/50' : ''
                          } flex items-center w-full px-4 py-3 text-sm text-gray-700 font-medium`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome back, {user?.name}! ✨
            </h1>
            <p className="text-gray-300 text-lg">
              Continue building amazing AI applications or explore new tools and features.
            </p>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-10">
          <nav className="flex space-x-2">
            {[
              { id: 'apps', label: 'My Apps', icon: Smartphone, gradient: 'from-emerald-500 to-teal-500' },
              { id: 'voice', label: 'Voice Cloning', icon: Mic, gradient: 'from-purple-500 to-pink-500' },
              { id: 'community', label: 'Community', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
              { id: 'ai-tools', label: 'AI Tools', icon: Wand2, gradient: 'from-orange-500 to-red-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'apps' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Total Apps', value: apps.length, icon: Bot, gradient: 'from-emerald-500 to-teal-500' },
                { label: 'Published', value: apps.filter(app => app.published).length, icon: Globe, gradient: 'from-blue-500 to-cyan-500' },
                { label: 'This Month', value: 2, icon: Calendar, gradient: 'from-purple-500 to-pink-500' },
                { label: 'Rating', value: '4.9', icon: Star, gradient: 'from-yellow-500 to-orange-500' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="app-card p-6 group hover:shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        {stat.value}
                        {stat.label === 'Rating' && <Star className="w-6 h-6 text-yellow-400 fill-current" />}
                      </p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Apps Section */}
            <div className="app-card p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Applications</h2>
                  <p className="text-gray-600">Manage and deploy your AI-powered apps</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">All Apps</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                  
                  <button onClick={handleCreateNew} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New App
                  </button>
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {searchQuery || filterBy !== 'all' ? 'No apps found' : 'No apps yet'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery || filterBy !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Create your first AI-powered application to get started.'
                    }
                  </p>
                  {!searchQuery && filterBy === 'all' && (
                    <button onClick={handleCreateNew} className="btn-primary flex items-center gap-2 mx-auto">
                      <Sparkles className="w-5 h-5" />
                      Create Your First App
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="app-card p-6 group cursor-pointer hover:shadow-2xl"
                      onClick={() => navigate(`/builder/${app.id}`)}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                            {app.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {app.description}
                          </p>
                        </div>
                        
                        <Menu as="div" className="relative">
                          <Menu.Button 
                            className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </Menu.Button>
                          
                          <Transition
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 py-2 z-10">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? 'bg-gray-100/50' : ''
                                    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                  >
                                    Edit
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? 'bg-gray-100/50' : ''
                                    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                  >
                                    Duplicate
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? 'bg-gray-100/50' : ''
                                    } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                  >
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-6">
                        {app.components.slice(0, 3).map((component, idx) => {
                          const Icon = getComponentIcon(component.type);
                          return (
                            <div key={idx} className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <Icon className="w-4 h-4 text-gray-600" />
                            </div>
                          );
                        })}
                        {app.components.length > 3 && (
                          <span className="text-xs text-gray-500 font-medium">
                            +{app.components.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            app.published ? 'bg-emerald-400' : 'bg-yellow-400'
                          }`} />
                          <span className="text-sm font-medium text-gray-600">
                            {app.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        
                        <span className="text-xs text-gray-500">
                          {new Date(app.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'voice' && (
          <div className="max-w-2xl mx-auto">
            <VoiceCloner onVoiceCloned={handleVoiceCloned} />
          </div>
        )}

        {activeTab === 'community' && <CommunityEvents />}

        {activeTab === 'ai-tools' && (
          <div className="max-w-2xl mx-auto">
            <AIComponentGenerator onComponentGenerated={handleComponentGenerated} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;