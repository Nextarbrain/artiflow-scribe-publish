
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContentModerationItem {
  id: string;
  article_id: string;
  moderator_id: string | null;
  status: string;
  feedback: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
  articles?: {
    title: string;
    content: string;
    user_id: string;
    profiles?: {
      full_name: string | null;
      email: string | null;
    } | null;
  } | null;
}

const ContentModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moderationItems, setModerationItems] = useState<ContentModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentModerationItem | null>(null);
  const [feedback, setFeedback] = useState('');

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_moderation')
        .select(`
          *,
          articles(
            title,
            content,
            user_id,
            profiles(full_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModerationItems(data || []);
    } catch (error: any) {
      console.error('Error fetching moderation items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch moderation queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (itemId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      const { error } = await supabase
        .from('content_moderation')
        .update({
          status,
          feedback: feedback || null,
          moderator_id: user?.id,
          moderated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Content ${status} successfully`,
      });

      await fetchModerationItems();
      setSelectedItem(null);
      setFeedback('');
    } catch (error: any) {
      console.error('Error moderating content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to moderate content",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchModerationItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate user-generated content</p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Moderator</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : moderationItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No content pending moderation
                </TableCell>
              </TableRow>
            ) : (
              moderationItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{item.articles?.title || 'Untitled'}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {item.articles?.content.substring(0, 100)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.articles?.profiles?.full_name || 'Unknown User'}</div>
                      <div className="text-sm text-gray-500">{item.articles?.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {getStatusBadge(item.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.moderator_id ? (
                      <div className="text-sm">
                        Moderated {item.moderated_at && formatDistanceToNow(new Date(item.moderated_at), { addSuffix: true })}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Content</DialogTitle>
                          </DialogHeader>
                          {selectedItem && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-lg font-semibold mb-2">{selectedItem.articles?.title}</h3>
                                <div className="prose max-w-none">
                                  <p className="whitespace-pre-wrap">{selectedItem.articles?.content}</p>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Feedback (optional)</label>
                                <Textarea
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Provide feedback for the author..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => moderateContent(selectedItem.id, 'rejected', feedback)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() => moderateContent(selectedItem.id, 'approved', feedback)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
