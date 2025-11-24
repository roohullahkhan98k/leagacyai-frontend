import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
        <WifiOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          You're offline. Some features may be limited.
        </span>
      </div>
    </div>
  );
};

