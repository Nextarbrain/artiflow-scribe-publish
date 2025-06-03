
import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap, Shield, Globe, DollarSign, Clock, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates high-quality, SEO-optimized articles from your images or ideas in minutes.'
    },
    {
      icon: Globe,
      title: 'Trusted Publisher Network',
      description: 'Access to 50+ verified publishers across different niches and industries.'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'Dynamic pricing based on article length and publisher selection. No hidden fees.'
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description: 'Get your articles published within hours, not days. Real-time status tracking.'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'All content is reviewed for quality, originality, and SEO optimization before publishing.'
    },
    {
      icon: Users,
      title: 'Account Management',
      description: 'Manage all your articles, track publications, and view analytics in one dashboard.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose ArticleAI?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to create and publish high-quality articles with the power of AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
