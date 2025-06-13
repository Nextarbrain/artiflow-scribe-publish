
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import ArticleForm from '@/components/ArticleForm';
import LoadingSpinner from '@/components/LoadingSpinner';

const CreateArticle = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking auth
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <LoadingSpinner message="Loading..." />
          </main>
        </div>
      </ThemeProvider>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <main>
          <ArticleForm />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default CreateArticle;
