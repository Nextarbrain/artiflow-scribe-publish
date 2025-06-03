
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import ArticleForm from '@/components/ArticleForm';

const CreateArticle = () => {
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
