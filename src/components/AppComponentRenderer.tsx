import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Image,
  Hand,
  Box,
  Video,
  BarChart,
  Sparkles
} from 'lucide-react';
import { AppComponent } from '../contexts/AppBuilderContext';

interface AppComponentRendererProps {
  component: AppComponent;
  onUpdate: (updates: Partial<AppComponent>) => void;
  onDelete: () => void;
}

const AppComponentRenderer: React.FC<AppComponentRendererProps> = ({
  component,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getIcon = () => {
    switch (component.type) {
      case 'text-input': return Type;
      case 'voice-output': return Mic;
      case 'language-selection': return Globe;
      case 'ai-copilot': return Bot;
      case 'image': return Image;
      case 'button': return Hand;
      case 'container': return Box;
      case 'video-player': return Video;
      case 'chat-interface': return MessageSquare;
      case 'image-generator': return Sparkles;
      case 'analytics': return BarChart;
      default: return MessageSquare;
    }
  };

  const getTitle = () => {
    switch (component.type) {
      case 'text-input': return 'Text Input';
      case 'voice-output': return 'Voice Output';
      case 'language-selection': return 'Language Selector';
      case 'ai-copilot': return 'AI Copilot';
      case 'image': return 'Image';
      case 'button': return 'Button';
      case 'container': return 'Container';
      case 'video-player': return 'Video Player';
      case 'chat-interface': return 'Chat Interface';
      case 'image-generator': return 'Image Generator';
      case 'analytics': return 'Analytics';
      default: return 'Component';
    }
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'text-input':
        return (
          <div className="space-y-2">
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700">
                {component.props.label}
              </label>
            )}
            <input
              type="text"
              placeholder={component.props.placeholder || 'Enter text...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
          </div>
        );

      case 'voice-output':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Voice Output</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-blue-600" />
                ) : (
                  <Play className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700">
                {component.props.text || 'Sample voice output text'}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Voice: {component.props.voice || 'Default'}
            </div>
          </div>
        );

      case 'language-selection':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Language
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {(component.props.languages || ['en', 'es', 'fr']).map((lang: string) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        );

      case 'ai-copilot':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">AI Assistant</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                {component.props.greeting || 'Hello! How can I assist you today?'}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Model: {component.props.model || 'GPT-4'} •
              Personality: {component.props.personality || 'Helpful'}
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="w-full">
            <img
              src={component.props.src || 'https://via.placeholder.com/300'}
              alt={component.props.alt || 'Placeholder'}
              className="w-full h-auto rounded-lg object-cover"
              style={{ width: component.props.width || '100%' }}
            />
          </div>
        );

      case 'button': {
        const btnClass = component.props.variant === 'secondary'
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-emerald-600 text-white hover:bg-emerald-700';

        return (
          <button className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${btnClass}`}>
            {component.props.label || 'Button'}
          </button>
        );
      }

      case 'container':
        return (
          <div
            className="w-full border-2 border-dashed border-gray-300 min-h-[100px] flex items-center justify-center text-gray-400 text-sm"
            style={{
              padding: component.props.padding || '16px',
              backgroundColor: component.props.background || '#ffffff',
              borderRadius: component.props.borderRadius || '8px'
            }}
          >
            Container Content
          </div>
        );

      case 'video-player':
        return (
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-white text-center">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Video Player</p>
              <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{component.props.src}</p>
            </div>
          </div>
        );

      case 'chat-interface':
        return (
          <div className={`w-full border rounded-lg overflow-hidden flex flex-col h-[300px] ${component.props.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b ${component.props.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <h4 className={`font-semibold ${component.props.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{component.props.title || 'Chat'}</h4>
            </div>
            <div className="flex-1 p-4">
              <div className={`max-w-[80%] rounded-lg p-3 mb-2 ${component.props.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {component.props.initialMessage || 'Welcome!'}
              </div>
            </div>
            <div className={`p-4 border-t ${component.props.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`w-full h-10 rounded-lg border ${component.props.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}></div>
            </div>
          </div>
        );

      case 'image-generator':
        return (
          <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">AI Image Generator</h4>
            </div>
            <div className="aspect-square bg-white border-2 border-dashed border-purple-200 rounded-lg flex items-center justify-center">
              <p className="text-sm text-purple-400">Generated Image Will Appear Here</p>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder={component.props.promptLabel || 'Describe image...'} className="flex-1 px-3 py-2 rounded border border-purple-200 text-sm" disabled />
              <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium opacity-50 cursor-not-allowed">
                {component.props.buttonText || 'Generate'}
              </button>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">{component.props.title || 'Analytics'}</h3>
              <select className="text-xs border-none bg-gray-50 rounded px-2 py-1">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-40 flex items-end justify-between gap-1 px-2">
              {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                <div key={i} className="w-full bg-blue-100 rounded-t hover:bg-blue-200 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h * 12}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-600">Unknown component type</p>
          </div>
        );
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-w-[250px] max-w-[350px]"
    >
      {/* Component Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">{getTitle()}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
          <div className="cursor-move p-1 hover:bg-gray-200 rounded" title="Move">
            <Move className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Component Content */}
      <div className="p-4">
        {renderComponent()}
      </div>

      {/* Settings Panel */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-3">Component Settings</h4>

          {component.type === 'text-input' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={component.props.label || ''}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, label: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={component.props.placeholder || ''}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, placeholder: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {component.type === 'voice-output' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Text to Speak
                </label>
                <textarea
                  value={component.props.text || ''}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, text: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={component.props.voice || 'default'}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, voice: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="elevenlabs-clara">ElevenLabs - Clara</option>
                  <option value="elevenlabs-james">ElevenLabs - James</option>
                  <option value="custom">Custom Voice</option>
                </select>
              </div>
            </div>
          )}

          {component.type === 'ai-copilot' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Greeting Message
                </label>
                <input
                  type="text"
                  value={component.props.greeting || ''}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, greeting: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  AI Model
                </label>
                <select
                  value={component.props.model || 'gpt-4'}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, model: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Personality
                </label>
                <select
                  value={component.props.personality || 'helpful'}
                  onChange={(e) => onUpdate({
                    props: { ...component.props, personality: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="helpful">Helpful</option>
                  <option value="creative">Creative</option>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>
          )}

          {component.type === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={component.props.src || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, src: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={component.props.alt || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, alt: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {component.type === 'button' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={component.props.label || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, label: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Variant</label>
                <select
                  value={component.props.variant || 'primary'}
                  onChange={(e) => onUpdate({ props: { ...component.props, variant: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>
            </div>
          )}

          {component.type === 'container' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
                <input
                  type="color"
                  value={component.props.background || '#ffffff'}
                  onChange={(e) => onUpdate({ props: { ...component.props, background: e.target.value } })}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Padding</label>
                <input
                  type="text"
                  value={component.props.padding || '16px'}
                  onChange={(e) => onUpdate({ props: { ...component.props, padding: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {component.type === 'video-player' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Video URL</label>
                <input
                  type="text"
                  value={component.props.src || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, src: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={component.props.autoplay || false}
                  onChange={(e) => onUpdate({ props: { ...component.props, autoplay: e.target.checked } })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-xs font-medium text-gray-700">Autoplay</label>
              </div>
            </div>
          )}

          {component.type === 'chat-interface' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={component.props.title || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, title: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Initial Message</label>
                <input
                  type="text"
                  value={component.props.initialMessage || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, initialMessage: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={component.props.theme || 'light'}
                  onChange={(e) => onUpdate({ props: { ...component.props, theme: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          )}

          {component.type === 'image-generator' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Prompt Placeholder</label>
                <input
                  type="text"
                  value={component.props.promptLabel || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, promptLabel: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={component.props.buttonText || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, buttonText: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {component.type === 'analytics' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chart Title</label>
                <input
                  type="text"
                  value={component.props.title || ''}
                  onChange={(e) => onUpdate({ props: { ...component.props, title: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chart Type</label>
                <select
                  value={component.props.chartType || 'line'}
                  onChange={(e) => onUpdate({ props: { ...component.props, chartType: e.target.value } })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AppComponentRenderer;