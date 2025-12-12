import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3,
  CreditCard,
  Package, 
  Users, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Load sidebar state from localStorage on mount
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
  const location = useLocation();
  const { user, logout } = useAuth();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  const menuItems = [
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/admin/analytics',
      key: 'analytics'
    },
    {
      icon: CreditCard,
      label: 'Subscriptions',
      path: '/admin/subscriptions',
      key: 'subscriptions'
    },
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

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar - Full height from top */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-full z-40`}>
        {/* Sidebar Header - Legacy AI Logo Only */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20" />
            <img 
              src="/legacy-logo.png" 
              alt="Legacy AI" 
              className={`relative ${sidebarOpen ? 'h-10' : 'h-8'} w-auto`}
              style={{ maxHeight: '40px', width: 'auto', height: 'auto' }}
              loading="eager"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Admin Header - Sticky at top with sidebar toggle */}
        <AdminHeader 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
