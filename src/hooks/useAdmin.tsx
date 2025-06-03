
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin status:', error);
        }

        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const makeUserAdmin = async (email: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      // This is a simplified version - in production you'd want more security
      const { error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: user?.id, // This would need to be the target user's ID
          role: 'admin' 
        });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  return { isAdmin, loading, makeUserAdmin };
};
