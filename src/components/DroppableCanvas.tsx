import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTemplate, useAppBuilder } from '../contexts/AppBuilderContext';
import AppComponentRenderer from './AppComponentRenderer';
import { Plus, Sparkles, Layers, Grid, Move, Wand2, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface DroppableCanvasProps {
  app?: AppTemplate;
}

interface CanvasItemProps {
  component: AppTemplate['components'][number];
  onUpdate: (updates: Partial<AppTemplate['components'][number]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isGridMode: boolean;
}

const CanvasItem: React.FC<CanvasItemProps> = ({ component, onUpdate, onDelete, onDuplicate, isGridMode }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'canvas-component',
    item: { id: component.id, position: component.position },
    end: (_item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      onUpdate({
        position: {
          x: Math.max(0, Math.round(component.position.x + delta.x)),
          y: Math.max(0, Math.round(component.position.y + delta.y)),
        },
      });
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [component, onUpdate]);

  if (isGridMode) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <AppComponentRenderer
          component={component}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          isGridMode={true}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'absolute', left: component.position.x, top: component.position.y }}
      className="z-10 cursor-move w-[340px]"
    >
      <AppComponentRenderer
        component={component}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        isGridMode={false}
      />
    </motion.div>
  );
};

const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ app }) => {
  const toast = useToast();
  const { currentApp, addComponent, updateComponent, removeComponent, duplicateComponent, saveApp } = useAppBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);

  const targetApp = app || currentApp;
  const components = targetApp?.components || [];
  const layoutMode = targetApp?.settings?.layoutMode || 'grid';

  const handleToggleLayoutMode = (newMode: 'grid' | 'freeform') => {
    if (!targetApp) return;
    saveApp({
      ...targetApp,
      settings: {
        ...targetApp.settings,
        layoutMode: newMode,
      },
    });
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { type: string; title: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      let x = 40;
      let y = 40 + components.length * 60;

      if (canvasRef.current && clientOffset) {
        const rect = canvasRef.current.getBoundingClientRect();
        x = Math.max(10, Math.round(clientOffset.x - rect.left));
        y = Math.max(10, Math.round(clientOffset.y - rect.top));
      }

      addComponent({
        type: item.type as any,
        props: getDefaultProps(item.type),
        position: { x, y }
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [components.length, addComponent]);

  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'text-input':
        return { placeholder: 'Enter your message...', label: 'Message' };
      case 'voice-output':
        return { voice: 'default', text: 'Hello! How can I help you today?' };
      case 'language-selection':
        return { languages: ['en', 'es', 'fr', 'de'], defaultLanguage: 'en' };
      case 'ai-copilot':
        return { model: 'gpt-4', personality: 'helpful', greeting: 'Hi! I\'m here to help.' };
      case 'image':
        return { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', alt: 'AI Art', width: '100%' };
      case 'button':
        return { label: 'Click Me', action: 'none', variant: 'primary' };
      case 'container':
        return { padding: '16px', background: '#0f172a', borderRadius: '12px' };
      case 'video-player':
        return { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', autoplay: false };
      case 'chat-interface':
        return { title: 'Chat Support', initialMessage: 'How can I help you?', theme: 'dark' };
      case 'image-generator':
        return { promptLabel: 'Describe image...', buttonText: 'Generate', aspect: '1:1' };
      case 'analytics':
        return { title: 'App Usage', metric: 'views', chartType: 'line' };
      default:
        return {};
    }
  };

  const handleAutoAlign = () => {
    if (!targetApp) return;
    const colWidth = 360;
    const rowHeight = 320;
    const cols = 3;

    const alignedComponents = components.map((comp, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        ...comp,
        position: {
          x: 40 + col * colWidth,
          y: 40 + row * rowHeight,
        },
      };
    });

    saveApp({ ...targetApp, components: alignedComponents });
    toast.success('Auto-aligned all components on canvas!');
  };

  const handleClearAll = () => {
    if (!targetApp || components.length === 0) return;
    saveApp({ ...targetApp, components: [] });
    toast.info('Canvas cleared.');
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950/90 rounded-2xl overflow-hidden">
      {/* Top Canvas Toolbar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => handleToggleLayoutMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                layoutMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Auto Grid
            </button>
            <button
              onClick={() => handleToggleLayoutMode('freeform')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                layoutMode === 'freeform'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" /> Freeform
            </button>
          </div>

          {layoutMode === 'freeform' && (
            <button
              onClick={handleAutoAlign}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              title="Auto align non-overlapping grid positions"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" /> Auto Align
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
            {components.length} {components.length === 1 ? 'Component' : 'Components'}
          </span>
          {components.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 bg-slate-900 hover:bg-red-500/20 border border-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas Drop Zone */}
      <div
        ref={(node) => {
          drop(node);
          (canvasRef as any).current = node;
        }}
        className={`relative flex-1 w-full h-full bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] overflow-auto transition-all ${
          isOver ? 'ring-2 ring-emerald-500/50 bg-slate-900/90' : ''
        }`}
      >
        {components.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-2xl">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                Drag Components Here <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                Select or drag components from the sidebar to assemble your interactive AI app canvas.
              </p>
              <div className="text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Try adding a <strong>Text Input</strong> or <strong>AI Copilot</strong>!
              </div>
            </div>
          </div>
        ) : layoutMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {components.map((component) => (
                <CanvasItem
                  key={component.id}
                  component={component}
                  onUpdate={(updates) => updateComponent(component.id, updates)}
                  onDelete={() => removeComponent(component.id)}
                  onDuplicate={() => {
                    if (duplicateComponent) {
                      duplicateComponent(component.id);
                    } else {
                      addComponent({
                        type: component.type,
                        props: { ...component.props },
                        position: { x: component.position.x + 30, y: component.position.y + 30 },
                      });
                    }
                  }}
                  isGridMode={true}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="relative w-full h-full min-h-[900px]">
            <AnimatePresence>
              {components.map((component) => (
                <CanvasItem
                  key={component.id}
                  component={component}
                  onUpdate={(updates) => updateComponent(component.id, updates)}
                  onDelete={() => removeComponent(component.id)}
                  onDuplicate={() => {
                    if (duplicateComponent) {
                      duplicateComponent(component.id);
                    } else {
                      addComponent({
                        type: component.type,
                        props: { ...component.props },
                        position: { x: component.position.x + 30, y: component.position.y + 30 },
                      });
                    }
                  }}
                  isGridMode={false}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {isOver && (
          <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500 border-dashed rounded-2xl flex items-center justify-center backdrop-blur-sm pointer-events-none z-30">
            <div className="text-emerald-400 font-bold text-sm bg-slate-950/90 border border-emerald-500/40 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> Drop component onto canvas
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableCanvas;
