
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { FileText, User, CheckCircle, XCircle, Eye } from 'lucide-react';
import ModerationDialog from './moderation/ModerationDialog';

interface ArticleForModeration {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  moderation_status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

const ContentModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<ArticleForModeration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArticlesForModeration = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          status,
          moderation_status,
          created_at,
          profiles!articles_user_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .in('status', ['draft', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data as ArticleForModeration[] || []);
    } catch (error) {
      console.error('Error fetching articles for moderation:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles for moderation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateArticle = async (articleId: string, status: 'approved' | 'rejected', feedback?: string) => {
    if (!user) return;

    try {
      // Update article status
      const articleStatus = status === 'approved' ? 'published' : 'rejected';
      const { error: articleError } = await supabase
        .from('articles')
        .update({
          status: articleStatus,
          moderation_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId);

      if (articleError) throw articleError;

      // Create or update moderation record
      const { error: moderationError } = await supabase
        .from('content_moderation')
        .upsert({
          article_id: articleId,
          status,
          moderator_id: user.id,
          moderated_at: new Date().toISOString(),
          feedback,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'article_id'
        });

      if (moderationError) throw moderationError;

      toast({
        title: "Article Moderated",
        description: `Article has been ${status}`,
      });

      // Refresh the list
      await fetchArticlesForModeration();
    } catch (error: any) {
      console.error('Error moderating article:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to moderate article",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, moderationStatus: string) => {
    if (moderationStatus === 'approved') {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    if (moderationStatus === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  useEffect(() => {
    fetchArticlesForModeration();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate user-generated articles</p>
        </div>
        <Button onClick={fetchArticlesForModeration} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No articles pending moderation
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{article.title}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {article.content.substring(0, 100)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{article.profiles?.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{article.profiles?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(article.status, article.moderation_status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <ModerationDialog 
                        item={{
                          id: article.id,
                          status: article.moderation_status,
                          created_at: article.created_at,
                          moderator_id: null,
                          moderated_at: null,
                          articles: {
                            title: article.title,
                            content: article.content,
                            profiles: article.profiles
                          }
                        }}
                        onModerate={moderateArticle}
                      />
                      
                      {article.moderation_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => moderateArticle(article.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => moderateArticle(article.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ContentModeration;
