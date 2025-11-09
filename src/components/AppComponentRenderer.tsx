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
  Pause
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
      default: return MessageSquare;
    }
  };

  const getTitle = () => {
    switch (component.type) {
      case 'text-input': return 'Text Input';
      case 'voice-output': return 'Voice Output';
      case 'language-selection': return 'Language Selector';
      case 'ai-copilot': return 'AI Copilot';
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
        </motion.div>
      )}
    </motion.div>
  );
};

export default AppComponentRenderer;