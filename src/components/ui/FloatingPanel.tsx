import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';
import { cn } from '../../utils/cn';

interface FloatingPanelProps extends HTMLAttributes<HTMLDivElement> {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClose?: () => void;
  showClose?: boolean;
  isCollapsible?: boolean;
}

const FloatingPanel = ({
  children,
  className,
  position = 'bottom-right',
  onClose,
  showClose = true,
  isCollapsible = true,
  ...props
}: FloatingPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'fixed bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-floating',
        'border border-gray-200 dark:border-gray-700 z-50',
        'max-w-md w-[calc(100vw-2rem)]',
        positionClasses[position],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {props.title && (
            <h3 className="text-sm font-medium">{props.title}</h3>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {isCollapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                {isCollapsed ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
            </button>
          )}
          {showClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default FloatingPanel;