
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ContentCreationOptions from '@/components/ContentCreationOptions';
import Features from '@/components/Features';
import ArticlePreview from '@/components/ArticlePreview';

const Index = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <main>
          <Hero />
          <ContentCreationOptions />
          <ArticlePreview />
          <Features />
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ArticleAI
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Transform your ideas into published articles with the power of AI
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 ArticleAI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
