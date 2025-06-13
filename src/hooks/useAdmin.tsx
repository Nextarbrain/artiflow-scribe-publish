
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Don't check admin status if user is not logged in or session is not ready
      if (!user || !session?.access_token) {
        console.log('useAdmin: No user or session, setting admin to false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('useAdmin: Checking admin status for user:', user.id, 'email:', user.email);
        
        // Special handling for nextarmain@gmail.com - always admin
        if (user.email === 'nextarmain@gmail.com') {
          console.log('useAdmin: Fixed admin user detected:', user.email);
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        
        // Add a small delay to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data, error } = await supabase
          .rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });

        if (error) {
          console.error('useAdmin: Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          console.log('useAdmin: Admin check result:', data);
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('useAdmin: Unexpected error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Only run admin check if we have a user and session
    if (user && session?.access_token) {
      checkAdminStatus();
    } else {
      // Reset admin status if no user/session
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user, session]);

  return { isAdmin, loading };
};
