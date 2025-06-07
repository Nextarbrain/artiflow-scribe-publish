
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
        console.log('Checking admin status for user:', user.id);
        
        // Use the security definer function to check admin status
        const { data, error } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });

        if (error) {
          console.error('Error checking admin status with RPC:', error);
          // Fallback to direct query if RPC fails
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
            setIsAdmin(!!roleData);
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

    checkAdminStatus();
  }, [user]);

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

  return { isAdmin, loading, makeUserAdmin };
};
