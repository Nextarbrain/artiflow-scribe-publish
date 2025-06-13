
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ContentModerationItem } from './types';

export const useModerationData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moderationItems, setModerationItems] = useState<ContentModerationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_moderation')
        .select(`
          *,
          articles!content_moderation_article_id_fkey(
            id,
            title,
            content,
            excerpt,
            created_at,
            user_id,
            profiles!articles_user_id_fkey(
              id,
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModerationItems((data || []) as ContentModerationItem[]);
    } catch (error) {
      console.error('Error fetching moderation items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch moderation items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (itemId: string, status: 'approved' | 'rejected', feedback?: string) => {
    if (!user) return;

    try {
      // Update moderation status
      const { error: moderationError } = await supabase
        .from('content_moderation')
        .update({
          status,
          moderator_id: user.id,
          moderated_at: new Date().toISOString(),
          feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (moderationError) throw moderationError;

      // Get the moderation item to find the article
      const { data: moderationItem } = await supabase
        .from('content_moderation')
        .select('article_id')
        .eq('id', itemId)
        .single();

      if (moderationItem?.article_id) {
        // Update article status based on moderation decision
        const articleStatus = status === 'approved' ? 'published' : 'rejected';
        const { error: articleError } = await supabase
          .from('articles')
          .update({
            status: articleStatus,
            moderation_status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', moderationItem.article_id);

        if (articleError) throw articleError;
      }

      toast({
        title: "Content Moderated",
        description: `Article has been ${status}`,
      });

      // Refresh the list
      await fetchModerationItems();
    } catch (error: any) {
      console.error('Error moderating content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to moderate content",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchModerationItems();
  }, []);

  return {
    moderationItems,
    loading,
    moderateContent,
    refetch: fetchModerationItems
  };
};
