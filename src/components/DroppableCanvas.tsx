import React from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTemplate, useAppBuilder } from '../contexts/AppBuilderContext';
import AppComponentRenderer from './AppComponentRenderer';

interface DroppableCanvasProps {
  app: AppTemplate;
}

const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ app }) => {
  const { addComponent, updateComponent, removeComponent } = useAppBuilder();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { type: string; title: string }, monitor) => {
      const offset = monitor.getDropResult() || monitor.getClientOffset();
      if (offset) {
        addComponent({
          type: item.type as any,
          props: getDefaultProps(item.type),
          position: { x: 100, y: 100 }
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'text-input':
        return { placeholder: 'Enter your message...', label: 'Message' };
      case 'voice-output':
        return { voice: 'default', text: 'Hello! How can I help you today?' };
      case 'language-selection':
        return { languages: ['en', 'es', 'fr'], defaultLanguage: 'en' };
      case 'ai-copilot':
        return { model: 'gpt-4', personality: 'helpful', greeting: 'Hi! I\'m here to help.' };
      case 'image':
        return { src: 'https://via.placeholder.com/300', alt: 'Placeholder', width: '100%' };
      case 'button':
        return { label: 'Click Me', action: 'none', variant: 'primary' };
      case 'container':
        return { padding: '16px', background: '#ffffff', borderRadius: '8px' };
      case 'video-player':
        return { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', autoplay: false };
      case 'chat-interface':
        return { title: 'Chat Support', initialMessage: 'How can I help you?', theme: 'light' };
      case 'image-generator':
        return { promptLabel: 'Describe image...', buttonText: 'Generate', aspect: '1:1' };
      case 'analytics':
        return { title: 'App Usage', metric: 'views', chartType: 'line' };
      default:
        return {};
    }
  };

  return (
    <div
      ref={drop}
      className={`drop-zone ${isOver ? 'drag-over' : ''} relative w-full h-full rounded-lg`}
    >
      {app.components.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your App</h3>
            <p className="text-gray-600 mb-4">
              Drag components from the library to start building your AI application.
            </p>
            <div className="text-sm text-gray-500">
              Try dragging a <strong>Text Input</strong> or <strong>AI Copilot</strong> component!
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <AnimatePresence>
            {app.components.map((component) => (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  left: component.position.x,
                  top: component.position.y,
                }}
                className="z-10"
              >
                <AppComponentRenderer
                  component={component}
                  onUpdate={(updates) => updateComponent(component.id, updates)}
                  onDelete={() => removeComponent(component.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {isOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center">
          <div className="text-blue-600 font-medium">Drop component here</div>
        </div>
      )}
    </div>
  );
};

export default DroppableCanvas;