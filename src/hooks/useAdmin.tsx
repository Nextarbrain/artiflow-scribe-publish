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
        console.log('No user or session available for admin check');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Ensure session is fully authenticated
      if (!session.access_token) {
        console.log('Session not fully authenticated yet, waiting...');
        setLoading(true);
        return;
      }

      try {
        console.log('Checking admin status for user:', user.id);
        console.log('Session access token exists:', !!session.access_token);
        
        // Add a small delay to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use the security definer function to check admin status
        const { data, error } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });

        if (error) {
          console.error('Error checking admin status with RPC:', error);
          
          // Retry logic - try direct query as fallback
          console.log('Retrying with direct query...');
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (roleError) {
            console.error('Error with fallback admin check:', roleError);
            setIsAdmin(false);
          } else {
            const hasAdminRole = !!roleData;
            console.log('Fallback admin check result:', hasAdminRole);
            setIsAdmin(hasAdminRole);
          }
        } else {
          console.log('Admin check result:', data);
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Unexpected error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay before initial check to ensure session is ready
    const timeoutId = setTimeout(checkAdminStatus, 100);

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
