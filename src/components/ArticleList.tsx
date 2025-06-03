import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Eye, Edit, Trash2, Calendar, User, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  category: string;
  status: string;
  views_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const ArticleList: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my' | 'published' | 'drafts'>('all');

  useEffect(() => {
    fetchArticles();
  }, [filter, user, isAdmin]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'my' && user) {
        query = query.eq('user_id', user.id);
      } else if (filter === 'published') {
        query = query.eq('status', 'published');
      } else if (filter === 'drafts' && user) {
        query = query.eq('user_id', user.id).eq('status', 'draft');
      } else if (filter === 'all' && !isAdmin) {
        // Non-admin users can only see published articles and their own
        if (user) {
          query = query.or(`status.eq.published,user_id.eq.${user.id}`);
        } else {
          query = query.eq('status', 'published');
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully",
      });

      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const incrementViews = async (id: string) => {
    try {
      await supabase
        .from('articles')
        .update({ 
          views_count: articles.find(a => a.id === id)?.views_count + 1 || 1 
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All Articles
        </Button>
        {user && (
          <Button
            variant={filter === 'my' ? 'default' : 'outline'}
            onClick={() => setFilter('my')}
            size="sm"
          >
            My Articles
          </Button>
        )}
        <Button
          variant={filter === 'published' ? 'default' : 'outline'}
          onClick={() => setFilter('published')}
          size="sm"
        >
          Published
        </Button>
        {user && (
          <Button
            variant={filter === 'drafts' ? 'default' : 'outline'}
            onClick={() => setFilter('drafts')}
            size="sm"
          >
            Drafts
          </Button>
        )}
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'my' ? "You haven't created any articles yet." : "No articles match your current filter."}
          </p>
          {user && (
            <Button onClick={() => navigate('/create-article')}>
              Create Your First Article
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                {article.featured_image_url && (
                  <div className="md:w-1/3">
                    <img
                      src={article.featured_image_url}
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className={`p-6 ${article.featured_image_url ? 'md:w-2/3' : 'w-full'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(article.status)}>
                        {article.status}
                      </Badge>
                      <Badge variant="outline">
                        {article.category}
                      </Badge>
                    </div>
                    {(user?.id === article.user_id || isAdmin) && (
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => navigate(`/edit-article/${article.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.profiles?.full_name || article.profiles?.email || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views_count || 0}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        incrementViews(article.id);
                        navigate(`/article/${article.id}`);
                      }}
                    >
                      Read More
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleList;
