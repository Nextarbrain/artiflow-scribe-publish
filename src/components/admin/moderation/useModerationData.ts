
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
          articles!inner(
            title,
            content,
            user_id,
            profiles!articles_user_id_fkey(
              full_name, 
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModerationItems((data as any) || []);
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
    fetchModerationItems,
    moderateContent
  };
};
