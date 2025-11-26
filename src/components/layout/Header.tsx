import { Link } from 'react-router-dom';
import { LogOut, User, Menu, X, LogIn, UserPlus, Palette, BrainCircuit, Network, Mic, Image } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { useState, useEffect } from 'react';

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

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm' 
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo Section - Left */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <img 
                  src="/legacy-logo.png" 
                  alt="Legacy AI" 
                  className="relative h-12 md:h-16 w-auto"
                />
              </div>
            </Link>
          </div>
          
          {/* Navigation - Center (Desktop) - Only show when authenticated */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1 mx-8 flex-1 justify-center">
              <Link 
                to="/memory-graph" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-blue-600/0 to-purple-600/0 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Memory Graph
              </Link>
              <Link 
                to="/voice-cloning" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-orange-600/0 to-red-600/0 hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Voice Cloning
              </Link>
              <Link 
                to="/avatar-service" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-green-600/0 to-emerald-600/0 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Avatars
              </Link>
              <Link 
                to="/interview" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-cyan-600/0 to-blue-600/0 hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Interview
              </Link>
              <Link 
                to="/multimedia" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-indigo-600/0 to-violet-600/0 hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Multimedia
              </Link>
            </nav>
          )}
        
          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-purple-700/30 backdrop-blur-sm">
                    {user?.avatar ? (
                      <img 
                        src={getAvatarUrl(user.avatar)} 
                        alt={user.username}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/30 shadow-md"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-blue-500/30 shadow-md">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {user?.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-105">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <img 
                src="/legacy-logo.png" 
                alt="Legacy AI" 
                className="h-10 w-auto"
              />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links - Only show when authenticated */}
          {isAuthenticated && (
            <nav className="flex-1 p-4 space-y-2">
              <Link 
                to="/memory-graph" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-blue-600/0 to-purple-600/0 hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                <Network className="h-5 w-5" />
                <span>Memory Graph</span>
              </Link>
              <Link 
                to="/voice-cloning" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-orange-600/0 to-red-600/0 hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                <Mic className="h-5 w-5" />
                <span>Voice Cloning</span>
              </Link>
              <Link 
                to="/avatar-service" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-green-600/0 to-emerald-600/0 hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
              >
                <User className="h-5 w-5" />
                <span>Avatars</span>
              </Link>
              <Link 
                to="/interview" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-cyan-600/0 to-blue-600/0 hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
              >
                <BrainCircuit className="h-5 w-5" />
                <span>Interview</span>
              </Link>
              <Link 
                to="/multimedia" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-white rounded-lg bg-gradient-to-r from-indigo-600/0 to-violet-600/0 hover:from-indigo-600 hover:to-violet-600 transition-all duration-200"
              >
                <Image className="h-5 w-5" />
                <span>Multimedia</span>
              </Link>
            </nav>
          )}

          {/* Content */}
          <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              </div>
              <ThemeToggle />
            </div>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200/50 dark:border-purple-700/30 backdrop-blur-sm">
                  {user?.avatar ? (
                    <img 
                      src={getAvatarUrl(user.avatar)} 
                      alt={user.username}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/30 shadow-md"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-blue-500/30 shadow-md">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {user?.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 rounded-lg transition-all duration-200">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg shadow-blue-500/25 transition-all duration-200">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
