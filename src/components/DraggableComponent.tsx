import React from 'react';
import { useDrag } from 'react-dnd';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface DraggableComponentProps {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  type,
  title,
  description,
  icon: Icon
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
      className={`component-item ${isDragging ? 'opacity-50' : ''} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
          <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default DraggableComponent;