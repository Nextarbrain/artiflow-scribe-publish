
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogIn, Zap, BookOpen, Plus, Crown } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ArticleAI
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => navigate('/articles')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Articles
            </Button>
            {user && (
              <Button
                variant="ghost"
                onClick={() => navigate('/create-article')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
              >
                <Crown className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            
            {loading ? (
              <div className="w-10 h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
