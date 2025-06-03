
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import ArticleList from '@/components/ArticleList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';

const Articles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-8 h-8" />
                Articles
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover amazing content from our community
              </p>
            </div>
            {user && (
              <Button onClick={() => navigate('/create-article')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            )}
          </div>
          <ArticleList />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Articles;
