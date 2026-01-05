import React from 'react';
import { Bot, Mic, Globe, Type, MessageSquare, Image, Video, BarChart, Hand, Box } from 'lucide-react';
import DraggableComponent from './DraggableComponent';

const ComponentLibrary = () => {
  const componentTypes = [
    {
      type: 'text-input',
      title: 'Text Input',
      description: 'Allow users to enter text',
      icon: Type,
      category: 'Input'
    },
    {
      type: 'voice-output',
      title: 'Voice Output',
      description: 'Text-to-speech with AI voices',
      icon: Mic,
      category: 'Output'
    },
    {
      type: 'language-selection',
      title: 'Language Selector',
      description: 'Multi-language support',
      icon: Globe,
      category: 'Localization'
    },
    {
      type: 'ai-copilot',
      title: 'AI Copilot',
      description: 'Intelligent assistant',
      icon: Bot,
      category: 'AI'
    },
    {
      type: 'image',
      title: 'Image Display',
      description: 'Show an image from URL',
      icon: Image,
      category: 'Media'
    },
    {
      type: 'button',
      title: 'Action Button',
      description: 'Trigger actions on click',
      icon: Hand,
      category: 'Input'
    },
    {
      type: 'container',
      title: 'Container',
      description: 'Group content together',
      icon: Box,
      category: 'Layout'
    },
    {
      type: 'chat-interface',
      title: 'Chat Interface',
      description: 'Interactive chat UI',
      icon: MessageSquare,
      category: 'Interface'
    },
    {
      type: 'image-generator',
      title: 'Image Generator',
      description: 'AI-powered image creation',
      icon: Image,
      category: 'AI'
    },
    {
      type: 'video-player',
      title: 'Video Player',
      description: 'Embedded video playback',
      icon: Video,
      category: 'Media'
    },
    {
      type: 'analytics',
      title: 'Analytics',
      description: 'Usage tracking and metrics',
      icon: BarChart,
      category: 'Analytics'
    }
  ];

  const categories = [...new Set(componentTypes.map(comp => comp.category))];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Library</h3>

      {categories.map(category => (
        <div key={category} className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            {category}
          </h4>

          <div className="space-y-3">
            {componentTypes
              .filter(comp => comp.category === category)
              .map(component => (
                <DraggableComponent
                  key={component.type}
                  type={component.type as any}
                  title={component.title}
                  description={component.description}
                  icon={component.icon}
                />
              ))}
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Pro Features</h4>
        <p className="text-xs text-blue-700 mb-3">
          Upgrade to Pro to unlock advanced components and unlimited apps.
        </p>
        <button className="btn-primary text-xs px-3 py-1">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default ComponentLibrary;