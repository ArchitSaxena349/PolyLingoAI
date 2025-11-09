import React from 'react';
import { AppTemplate } from '../lib/supabase';
import { Bot, Mic, Globe, Smartphone } from 'lucide-react';

interface AppPreviewProps {
  app: AppTemplate;
}

const AppPreview: React.FC<AppPreviewProps> = ({ app }) => {
  const renderPreviewComponent = (component: any) => {
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
            />
          </div>
        );

      case 'voice-output':
        return (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Voice Output</span>
            </div>
            <p className="text-sm text-blue-700">
              {component.props.text || 'Voice output will speak this text.'}
            </p>
            <div className="mt-2 text-xs text-blue-600">
              Voice: {component.props.voice || 'Default'}
            </div>
          </div>
        );

      case 'language-selection':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Globe className="w-4 h-4 inline mr-2" />
              Select Language
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">AI Assistant</span>
            </div>
            <div className="p-3 bg-white rounded border">
              <p className="text-sm text-gray-700">
                {component.props.greeting || 'Hello! How can I help you today?'}
              </p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Powered by {component.props.model || 'GPT-4'}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <p className="text-sm text-gray-600">Unknown Component</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">App Preview</h3>
        <p className="text-sm text-gray-600">
          This is how your app will look to users.
        </p>
      </div>

      {/* Mobile Preview Frame */}
      <div className="max-w-xs mx-auto bg-black rounded-3xl p-2">
        <div className="bg-white rounded-2xl overflow-hidden min-h-[600px]">
          {/* App Header */}
          <div 
            className="p-4 text-white"
            style={{ backgroundColor: app.settings.primaryColor }}
          >
            <h1 className="text-lg font-semibold">{app.title}</h1>
            {app.description && (
              <p className="text-sm opacity-90 mt-1">{app.description}</p>
            )}
          </div>

          {/* App Content */}
          <div className="p-4 space-y-4">
            {app.components.length === 0 ? (
              <div className="text-center py-12">
                <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Add components to see the preview
                </p>
              </div>
            ) : (
              app.components.map((component: any) => (
                <div key={component.id} className="mb-4">
                  {renderPreviewComponent(component)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">App Information</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>Components:</strong> {app.components.length}</p>
          <p><strong>Language:</strong> {app.settings.language.toUpperCase()}</p>
          <p><strong>Voice:</strong> {app.settings.voice}</p>
          <p><strong>Status:</strong> {app.published ? 'Published' : 'Draft'}</p>
        </div>
      </div>
    </div>
  );
};

export default AppPreview;