import { useState, useRef, useEffect } from 'react';
import { GripVertical, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DraggablePanelProps {
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  className?: string;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

const DraggablePanel = ({
  children,
  title,
  onClose,
  defaultPosition = { x: 20, y: 20 },
  defaultSize = { width: 400, height: 300 },
  minWidth = 300,
  minHeight = 200,
  className
}: DraggablePanelProps) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialRect, setInitialRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        setPosition(prev => ({
          x: Math.max(0, Math.min(window.innerWidth - size.width, prev.x + dx)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, prev.y + dy))
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        let newX = initialRect.x;
        let newY = initialRect.y;
        let newWidth = initialRect.width;
        let newHeight = initialRect.height;

        // Handle horizontal resizing
        if (isResizing.includes('w')) {
          newX = Math.min(initialRect.x + dx, initialRect.x + initialRect.width - minWidth);
          newWidth = Math.max(minWidth, initialRect.width - dx);
        } else if (isResizing.includes('e')) {
          newWidth = Math.max(minWidth, initialRect.width + dx);
        }

        // Handle vertical resizing
        if (isResizing.includes('n')) {
          newY = Math.min(initialRect.y + dy, initialRect.y + initialRect.height - minHeight);
          newHeight = Math.max(minHeight, initialRect.height - dy);
        } else if (isResizing.includes('s')) {
          newHeight = Math.max(minHeight, initialRect.height + dy);
        }

        setPosition({ x: newX, y: newY });
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, initialRect, minWidth, minHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (handle: ResizeHandle) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setInitialRect({
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height
      });
    }
  };

  const resizeHandles = {
    n: 'top-0 left-1/2 -translate-x-1/2 h-1 w-20 cursor-n-resize',
    s: 'bottom-0 left-1/2 -translate-x-1/2 h-1 w-20 cursor-s-resize',
    e: 'right-0 top-1/2 -translate-y-1/2 w-1 h-20 cursor-e-resize',
    w: 'left-0 top-1/2 -translate-y-1/2 w-1 h-20 cursor-w-resize',
    ne: 'top-0 right-0 h-3 w-3 cursor-ne-resize',
    nw: 'top-0 left-0 h-3 w-3 cursor-nw-resize',
    se: 'bottom-0 right-0 h-3 w-3 cursor-se-resize',
    sw: 'bottom-0 left-0 h-3 w-3 cursor-sw-resize'
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 50,
      }}
      className={cn(
        'bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/30 dark:border-gray-700/30',
        'flex flex-col hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors',
        className
      )}
    >
      <div
        className="flex items-center px-4 py-2 border-b border-gray-200/30 dark:border-gray-700/30 cursor-move select-none bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
        <span className="text-sm font-medium flex-1 bg-white/80 dark:bg-gray-900/80 px-2 py-0.5 rounded">{title}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>

      {/* Resize handles */}
      {Object.entries(resizeHandles).map(([handle, className]) => (
        <div
          key={handle}
          className={cn('absolute', className)}
          onMouseDown={handleResizeStart(handle as ResizeHandle)}
        />
      ))}
    </div>
  );
};

export default DraggablePanel;