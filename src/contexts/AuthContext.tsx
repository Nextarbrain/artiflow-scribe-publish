
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
    let sessionInitialized = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('AuthContext: Auth state changed:', event, session?.user?.email);
        console.log('AuthContext: Session has access token:', !!session?.access_token);
        console.log('AuthContext: Event type:', event);
        
        // Handle different auth events
        if (event === 'INITIAL_SESSION') {
          sessionInitialized = true;
          console.log('AuthContext: Initial session loaded');
        }
        
        if (session?.user && session?.access_token) {
          console.log('AuthContext: Setting valid session and user');
          setSession(session);
          setUser(session.user);
          
          // Create/update profile for new signups or signins
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('AuthContext: User signed in, creating/updating profile');
            // Small delay to ensure session is fully established
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
            }, 100);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out, clearing session and user');
          setSession(null);
          setUser(null);
        } else if (event === 'INITIAL_SESSION' && !session) {
          console.log('AuthContext: No initial session found');
          setSession(null);
          setUser(null);
        }
        
        // Only set loading to false after initial session check is complete
        if (event === 'INITIAL_SESSION' || sessionInitialized) {
          console.log('AuthContext: Setting loading to false');
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          if (session?.access_token) {
            console.log('AuthContext: Initial session loaded with access token');
            setSession(session);
            setUser(session?.user ?? null);
          } else {
            console.log('AuthContext: No valid initial session');
            setSession(null);
            setUser(null);
          }
          
          // Ensure loading is set to false if we haven't received the INITIAL_SESSION event
          if (!sessionInitialized) {
            setTimeout(() => {
              if (mounted && !sessionInitialized) {
                console.log('AuthContext: Timeout - setting loading to false');
                setLoading(false);
              }
            }, 2000);
          }
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
      console.log('AuthContext: Refreshing session');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      console.log('AuthContext: Session refreshed successfully');
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting email/password sign in');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('AuthContext: Sign in error:', error);
      } else {
        console.log('AuthContext: Email sign in successful');
      }
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('AuthContext: Attempting sign up');
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName } : undefined,
        }
      });
      if (error) {
        console.error('AuthContext: Sign up error:', error);
      } else {
        console.log('AuthContext: Sign up successful');
      }
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('AuthContext: Attempting Google sign in');
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
      if (error) {
        console.error('AuthContext: Google sign in error:', error);
      } else {
        console.log('AuthContext: Google sign in initiated');
      }
      return { error };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out');
      await supabase.auth.signOut();
      // Clear any saved data
      localStorage.removeItem('selectedPublishers');
      console.log('AuthContext: Sign out successful');
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
