import { useLocation } from 'react-router-dom';
import { Package, Users, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

// Helper to get backend URL from environment
const getBackendUrl = (): string => {
  const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
  return rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';
};

// Helper to convert relative avatar URL to absolute URL
const getAvatarUrl = (avatar?: string): string | undefined => {
  if (!avatar) return undefined;
  // If already absolute URL, return as is
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // Otherwise, prepend backend URL
  const backendUrl = getBackendUrl();
  return backendUrl ? `${backendUrl}${avatar.startsWith('/') ? '' : '/'}${avatar}` : avatar;
};

interface AdminHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const AdminHeader = ({ sidebarOpen, onToggleSidebar }: AdminHeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      icon: Package,
      label: 'Packages',
      path: '/admin/packages',
      key: 'packages'
    },
    {
      icon: Users,
      label: 'Users',
      path: '/admin/users',
      key: 'users'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const currentPage = menuItems.find(item => isActive(item.path));

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button - Close to sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentPage?.label || 'Admin Panel'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Manage your platform
            </p>
          </div>
        </div>
        
        {/* Right side - Admin badge and theme toggle */}
        <div className="flex items-center gap-3">
          {/* Admin Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
            {user?.avatar ? (
              <img 
                src={getAvatarUrl(user.avatar)} 
                alt={user.username}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {user?.username || 'Admin'}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Administrator
              </p>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
