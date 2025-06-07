import React, { createContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('AuthContext: Auth state changed:', event, session?.user?.email);
        console.log('AuthContext: Session has access token:', !!session?.access_token);
        
        if (session?.user && session?.access_token) {
          console.log('AuthContext: Setting valid session and user');
          setSession(session);
          setUser(session.user);
          
          // Create profile if it doesn't exist (for new users)
          if (event === 'SIGNED_IN') {
            console.log('AuthContext: User signed in, creating/updating profile');
            // Small delay to ensure session is fully established before profile operations
            setTimeout(async () => {
              try {
                const { error: profileError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                    avatar_url: session.user.user_metadata?.avatar_url
                  }, { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                  });

                if (profileError) {
                  console.error('AuthContext: Error creating/updating profile:', profileError);
                } else {
                  console.log('AuthContext: Profile created/updated successfully');
                }
              } catch (error) {
                console.error('AuthContext: Error handling profile creation:', error);
              }
            }, 100); // Reduced delay
          }
        } else {
          console.log('AuthContext: Clearing session and user');
          setSession(null);
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
        }
        if (mounted && session?.access_token) {
          console.log('AuthContext: Initial session loaded with access token');
          setSession(session);
          setUser(session?.user ?? null);
        }
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName } : undefined,
        }
      });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      return { error };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
