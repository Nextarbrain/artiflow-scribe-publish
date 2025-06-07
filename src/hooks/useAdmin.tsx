import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !session) {
        console.log('useAdmin: No user or session available for admin check');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Ensure session is fully authenticated
      if (!session.access_token) {
        console.log('useAdmin: Session not fully authenticated yet, waiting...');
        setLoading(true);
        return;
      }

      try {
        console.log('useAdmin: Checking admin status for user:', user.id);
        
        // Use the security definer function to check admin status
        const { data, error } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });

        if (error) {
          console.error('useAdmin: Error checking admin status with RPC:', error);
          
          // Retry logic - try direct query as fallback
          console.log('useAdmin: Retrying with direct query...');
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (roleError) {
            console.error('useAdmin: Error with fallback admin check:', roleError);
            setIsAdmin(false);
          } else {
            const hasAdminRole = !!roleData;
            console.log('useAdmin: Fallback admin check result:', hasAdminRole);
            setIsAdmin(hasAdminRole);
          }
        } else {
          console.log('useAdmin: Admin check result:', data);
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('useAdmin: Unexpected error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Reduced delay for faster admin checks
    const timeoutId = setTimeout(checkAdminStatus, 50);

    return () => clearTimeout(timeoutId);
  }, [user, session]);

  const makeUserAdmin = async (targetUserId: string) => {
    if (!isAdmin || !user) {
      console.error('Unauthorized: User is not admin or not authenticated');
      return { error: 'Unauthorized' };
    }

    try {
      console.log('Making user admin:', targetUserId);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: targetUserId,
          role: 'admin' 
        });

      if (error) {
        console.error('Error making user admin:', error);
        return { error: error.message };
      }

      console.log('Successfully made user admin');
      return { error: null };
    } catch (error) {
      console.error('Error making user admin:', error);
      return { error: 'Failed to make user admin' };
    }
  };

  const removeUserRole = async (targetUserId: string, role: 'admin' | 'user') => {
    if (!isAdmin || !user) {
      console.error('Unauthorized: User is not admin or not authenticated');
      return { error: 'Unauthorized' };
    }

    try {
      console.log('Removing role for user:', targetUserId, role);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role);

      if (error) {
        console.error('Error removing user role:', error);
        return { error: error.message };
      }

      console.log('Successfully removed user role');
      return { error: null };
    } catch (error) {
      console.error('Error removing user role:', error);
      return { error: 'Failed to remove user role' };
    }
  };

  return { isAdmin, loading, makeUserAdmin, removeUserRole };
};
