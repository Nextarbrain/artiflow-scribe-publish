
import React from 'react';
import Hero from '@/components/Hero';
import ContentCreationOptions from '@/components/ContentCreationOptions';
import Features from '@/components/Features';
import ArticlePreview from '@/components/ArticlePreview';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <main>
        <Hero />
        
        {/* Quick Actions Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Get Started Today
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/articles')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Articles
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/create-article')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Create Article
              </Button>
            </div>
          </div>
        </section>

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
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ArticleAI
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Transform your ideas into published articles with the power of AI
            </p>
            <div className="flex justify-center space-x-6 mb-4">
              <Button variant="ghost" onClick={() => navigate('/articles')}>
                Articles
              </Button>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 ArticleAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
