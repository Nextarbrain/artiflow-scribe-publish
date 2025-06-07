
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { BookOpen, Plus, User, FileText, BarChart3, Clock, DollarSign, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch user's articles and drafts
  const { data: articles, isLoading } = useQuery({
    queryKey: ['user-articles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          status,
          draft_stage,
          payment_status,
          total_cost,
          created_at,
          publisher:publishers(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  const getDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const drafts = articles?.filter(article => article.status === 'draft') || [];
  const published = articles?.filter(article => article.status === 'published') || [];

  const handleResumeDraft = (article: any) => {
    if (article.draft_stage === 'payment') {
      navigate('/preview-article', { state: { articleId: article.id } });
    } else {
      navigate('/write-article', { state: { publisherId: article.publisher?.id, articleId: article.id } });
    }
  };

  const quickActions = [
    {
      title: 'Create Article',
      description: 'Start the publishing process',
      icon: Plus,
      onClick: () => navigate('/select-publisher'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Browse Articles',
      description: 'Explore all published articles',
      icon: BookOpen,
      onClick: () => navigate('/articles'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'My Articles',
      description: 'View your published articles',
      icon: FileText,
      onClick: () => navigate('/articles', { state: { filter: 'my' } }),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Profile Settings',
      description: 'Manage your profile',
      icon: User,
      onClick: () => navigate('/profile'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <>
      <Header />
      <div className="container max-w-6xl py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {getDisplayName()}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your personalized dashboard to manage your articles and drafts.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer transition-all hover:shadow-lg" onClick={action.onClick}>
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{published.length}</div>
              <p className="text-xs text-muted-foreground">
                Published articles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Articles</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drafts.length}</div>
              <p className="text-xs text-muted-foreground">
                Articles in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${((published.reduce((sum, article) => sum + (article.total_cost || 0), 0)) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                On published articles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Drafts Section */}
        {drafts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Drafts</CardTitle>
              <CardDescription>Continue working on your unpublished articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <div key={draft.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{draft.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge variant={draft.draft_stage === 'payment' ? 'default' : 'secondary'}>
                          {draft.draft_stage === 'payment' ? 'Ready to Pay' : 'Writing'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Publisher: {draft.publisher?.name || 'Not selected'}
                        </span>
                        {draft.total_cost && (
                          <span className="text-sm text-gray-500">
                            ${(draft.total_cost / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => handleResumeDraft(draft)} size="sm">
                      {draft.draft_stage === 'payment' ? 'Complete Payment' : 'Continue Writing'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading...</p>
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="space-y-4">
                {articles.slice(0, 5).map((article) => (
                  <div key={article.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      article.status === 'published' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      {article.status === 'published' ? (
                        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{article.title}</p>
                      <p className="text-sm text-gray-500">
                        {article.status === 'published' ? 'Published' : 'Draft'} • {' '}
                        {new Date(article.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Start by creating your first article!</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/select-publisher')}
                >
                  Create Article
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
