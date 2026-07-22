import { Bot, Mic, Globe, Type, MessageSquare, Image, Video, BarChart, Hand, Box, Sparkles } from 'lucide-react';
import DraggableComponent from './DraggableComponent';
import { AppComponent, useAppBuilder } from '../contexts/AppBuilderContext';

const ComponentLibrary = () => {
  const { addComponent, currentApp } = useAppBuilder();
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

  const defaultProps = (type: AppComponent['type']): Record<string, unknown> => {
    switch (type) {
      case 'text-input': return { placeholder: 'Enter your message...', label: 'Message' };
      case 'voice-output': return { voice: 'default', text: 'Hello! How can I help you today?' };
      case 'language-selection': return { languages: ['en', 'es', 'fr'], defaultLanguage: 'en' };
      case 'ai-copilot': return { model: 'gpt-4', personality: 'helpful', greeting: 'Hi! I\'m here to help.' };
      case 'image': return { src: '', alt: 'Image' };
      case 'button': return { label: 'Click Me', variant: 'primary' };
      case 'container': return { padding: '16px', background: '#0f172a', borderRadius: '12px' };
      case 'video-player': return { src: '', autoplay: false };
      case 'chat-interface': return { title: 'Chat Support', initialMessage: 'How can I help you?', theme: 'dark' };
      case 'image-generator': return { promptLabel: 'Describe image...', buttonText: 'Generate' };
      case 'analytics': return { title: 'App Usage', metric: 'views', chartType: 'line' };
      default: return {};
    }
  };

  const addFromLibrary = (type: AppComponent['type']) => {
    const index = currentApp?.components.length || 0;
    addComponent({ type, props: defaultProps(type), position: { x: 32 + index * 20, y: 32 + index * 20 } });
  };

  return (
    <div className="p-5 space-y-6">
      <div>
        <h3 className="text-sm font-extrabold text-white mb-1 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Component Library
        </h3>
        <p className="text-[11px] text-slate-400">
          Click or drag components directly onto your app builder canvas.
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-2.5">
          <h4 className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest px-1">
            {category}
          </h4>

          <div className="space-y-2">
            {componentTypes
              .filter(comp => comp.category === category)
              .map(component => (
                <DraggableComponent
                  key={component.type}
                  type={component.type as any}
                  title={component.title}
                  description={component.description}
                  icon={component.icon}
                  onAdd={() => addFromLibrary(component.type as AppComponent['type'])}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComponentLibrary;
