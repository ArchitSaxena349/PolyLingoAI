import React from 'react';
import { useDrag } from 'react-dnd';
import type { LucideIcon } from 'lucide-react';

interface DraggableComponentProps {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  onAdd?: () => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  type,
  title,
  description,
  icon: Icon,
  onAdd
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type, title },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      role="button"
      tabIndex={0}
      onClick={onAdd}
      onKeyDown={(event) => {
        if (onAdd && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onAdd();
        }
      }}
      aria-label={`Add ${title}`}
      className={`bg-slate-950/90 border border-slate-800/90 hover:border-emerald-500/50 rounded-2xl p-3.5 cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 group ${
        isDragging ? 'opacity-40 scale-95' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
            {title}
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default DraggableComponent;
