
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Share2 } from 'lucide-react';

const ArticlePreview = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            See How Your Articles Will Look
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Preview your article as it would appear on a live publication site
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-xl border-gray-200 dark:border-gray-700">
            {/* Article Header */}
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 p-8">
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  Technology
                </Badge>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  5 min read
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                The Future of AI in Content Creation: A Revolutionary Approach
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Discover how artificial intelligence is transforming the way we create, 
                edit, and publish content across digital platforms.
              </p>
            </div>

            {/* Article Content */}
            <div className="p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <img 
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80" 
                  alt="AI Technology" 
                  className="w-full h-64 object-cover rounded-lg mb-8"
                />
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  In today's rapidly evolving digital landscape, artificial intelligence has emerged 
                  as a game-changer in content creation. From generating compelling articles to 
                  optimizing SEO performance, AI tools are revolutionizing how businesses and 
                  content creators approach their work.
                </p>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  The AI Advantage
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Modern AI systems can analyze vast amounts of data, understand context, and 
                  generate human-like content that resonates with target audiences. This 
                  capability has opened new possibilities for businesses to scale their content 
                  production while maintaining quality and relevance.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500 mb-6">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "AI doesn't replace human creativity—it amplifies it, allowing creators to focus 
                    on strategy and innovation while automation handles the heavy lifting."
                  </p>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  As we move forward, the integration of AI in content creation will continue to 
                  evolve, offering even more sophisticated tools and capabilities that will shape 
                  the future of digital communication.
                </p>
              </div>

              {/* Article Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm">1.2k views</span>
                  </div>
                  <div className="flex items-center">
                    <Share2 className="w-4 h-4 mr-1" />
                    <span className="text-sm">Share</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Published on TechPublisher.com
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ArticlePreview;
