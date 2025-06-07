
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, CreditCard, Clock, Eye, Share2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ArticlePublisher {
  publisher: {
    id: string;
    name: string;
    category: string | null;
  };
  cost: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  tags: string[] | null;
  total_cost: number;
  article_publishers: ArticlePublisher[];
}

const PreviewArticle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const articleId = location.state?.articleId;
    if (!articleId) {
      navigate('/select-publisher');
      return;
    }

    fetchArticle(articleId);
  }, [user, location.state, navigate]);

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          meta_description,
          tags,
          total_cost,
          article_publishers(
            cost,
            publisher:publishers(id, name, category)
          )
        `)
        .eq('id', articleId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setArticle(data as Article);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Error",
        description: "Failed to load article. Please try again.",
        variant: "destructive",
      });
      navigate('/select-publisher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditArticle = () => {
    if (article) {
      const selectedPublishers = article.article_publishers.map(ap => ({
        id: ap.publisher.id,
        name: ap.publisher.name,
        category: ap.publisher.category,
        price_per_article: ap.cost
      }));
      navigate('/write-article', { state: { selectedPublishers, articleId: article.id } });
    }
  };

  const handlePayToPublish = () => {
    if (article) {
      navigate('/payment', { state: { articleId: article.id } });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container max-w-4xl py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article preview...</p>
          </div>
        </div>
      </>
    );
  }

  if (!article) return null;

  return (
    <>
      <Header />
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              const selectedPublishers = article.article_publishers.map(ap => ({
                id: ap.publisher.id,
                name: ap.publisher.name,
                category: ap.publisher.category,
                price_per_article: ap.cost
              }));
              navigate('/write-article', { state: { selectedPublishers } });
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Ready to Publish?
            </h2>
            <p className="text-blue-700 dark:text-blue-200 mb-3">
              Your article will be published to <strong>{article.article_publishers.length} publisher{article.article_publishers.length > 1 ? 's' : ''}</strong> for{' '}
              <strong>{formatPrice(article.total_cost)}</strong>
            </p>
            <div className="space-y-2">
              {article.article_publishers.map((ap, index) => (
                <div key={index} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded">
                  <span className="text-sm font-medium">{ap.publisher.name}</span>
                  <Badge variant="outline">{formatPrice(ap.cost)}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="overflow-hidden shadow-xl border-gray-200 dark:border-gray-700 mb-6">
          {/* Article Header */}
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 p-8">
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {article.article_publishers.length} Publisher{article.article_publishers.length > 1 ? 's' : ''}
              </Badge>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                5 min read
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          <CardContent className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div 
                className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="text-sm">Preview Mode</span>
                </div>
                <div className="flex items-center">
                  <Share2 className="w-4 h-4 mr-1" />
                  <span className="text-sm">Ready to Share</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Publishing to {article.article_publishers.length} publisher{article.article_publishers.length > 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={handleEditArticle}
            size="lg"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Article
          </Button>
          
          <Button 
            onClick={handlePayToPublish}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay to Publish ({formatPrice(article.total_cost)})
          </Button>
        </div>
      </div>
    </>
  );
};

export default PreviewArticle;
