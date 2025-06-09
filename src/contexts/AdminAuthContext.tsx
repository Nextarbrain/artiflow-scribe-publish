
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  adminUser: any | null;
  adminSession: string | null;
  loading: boolean;
  signInAdmin: (adminId: string, password: string) => Promise<{ error: any }>;
  signOutAdmin: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [adminSession, setAdminSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const checkAdminSession = async () => {
      try {
        const sessionToken = localStorage.getItem('admin_session_token');
        if (sessionToken) {
          const { data, error } = await supabase.rpc('validate_admin_session', {
            _session_token: sessionToken
          });

          if (error || !data) {
            localStorage.removeItem('admin_session_token');
            setAdminSession(null);
            setAdminUser(null);
          } else {
            setAdminSession(sessionToken);
            // Fetch admin details
            const { data: adminData } = await supabase
              .from('admin_credentials')
              .select('*')
              .eq('admin_id', data)
              .single();
            
            if (adminData) {
              setAdminUser(adminData);
            }
          }
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const signInAdmin = async (adminId: string, password: string) => {
    try {
      // Authenticate admin
      const { data, error } = await supabase.rpc('authenticate_admin', {
        _admin_id: adminId,
        _password: password
      });

      if (error || !data || data.length === 0) {
        return { error: { message: 'Invalid credentials' } };
      }

      const admin = data[0];

      // Create session
      const { data: sessionToken, error: sessionError } = await supabase.rpc('create_admin_session', {
        _admin_id: adminId
      });

      if (sessionError || !sessionToken) {
        return { error: { message: 'Failed to create session' } };
      }

      // Update last login
      await supabase.rpc('update_admin_login', { _admin_id: adminId });

      // Store session
      localStorage.setItem('admin_session_token', sessionToken);
      setAdminSession(sessionToken);
      setAdminUser(admin);

      return { error: null };
    } catch (error) {
      console.error('Admin sign in error:', error);
      return { error };
    }
  };

  const signOutAdmin = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (sessionToken) {
        // Delete session from database
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('session_token', sessionToken);
      }

      localStorage.removeItem('admin_session_token');
      setAdminSession(null);
      setAdminUser(null);
    } catch (error) {
      console.error('Admin sign out error:', error);
    }
  };

  const isAuthenticated = !!adminUser && !!adminSession;

  return (
    <AdminAuthContext.Provider value={{
      adminUser,
      adminSession,
      loading,
      signInAdmin,
      signOutAdmin,
      isAuthenticated,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
