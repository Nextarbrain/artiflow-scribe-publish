
import React, { createContext, useEffect, useState, useCallback } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);

  const updateProfile = useCallback(async (userData: User, isNewSignup = false) => {
    try {
      console.log('AuthContext: Updating profile for user:', userData.id);
      console.log('AuthContext: User metadata:', userData.user_metadata);
      
      const profileData = {
        id: userData.id,
        email: userData.email,
        full_name: userData.user_metadata?.full_name || userData.user_metadata?.name || null,
        avatar_url: userData.user_metadata?.avatar_url || userData.user_metadata?.picture || null,
        last_login_at: new Date().toISOString(),
        email_verified: userData.email_confirmed_at ? true : false
      };

      console.log('AuthContext: Profile data to upsert:', profileData);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (profileError) {
        console.error('AuthContext: Error updating profile:', profileError);
        console.error('AuthContext: Profile error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
      } else {
        console.log('AuthContext: Profile updated successfully:', data);
      }
    } catch (error) {
      console.error('AuthContext: Error in updateProfile:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('AuthContext: Auth state changed:', event, session?.user?.email);
      console.log('AuthContext: Full session data:', session);
      
      try {
        if (session?.user && session?.access_token) {
          console.log('AuthContext: Setting valid session and user');
          setSession(session);
          setUser(session.user);
          
          // Update profile for all sign-ins (including Google OAuth)
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('AuthContext: Updating profile after sign in/token refresh');
            console.log('AuthContext: User data for profile update:', session.user);
            // Use immediate execution instead of setTimeout to ensure it runs
            await updateProfile(session.user);
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
      } catch (error) {
        console.error('AuthContext: Error handling auth state change:', error);
      } finally {
        if (!isInitialized) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
            setIsInitialized(true);
          }
          return;
        }
        
        if (mounted) {
          if (session?.access_token) {
            console.log('AuthContext: Initial session loaded with access token');
            setSession(session);
            setUser(session?.user ?? null);
            
            // Update profile for initial session if user exists
            if (session.user) {
              console.log('AuthContext: Updating profile for initial session user');
              await updateProfile(session.user);
            }
          } else {
            console.log('AuthContext: No valid initial session');
            setSession(null);
            setUser(null);
          }
          
          if (!isInitialized) {
            setLoading(false);
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
        if (mounted && !isInitialized) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Add timeout for initial session check
    const sessionTimeout = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.warn('AuthContext: Session check timeout, setting loading to false');
        setLoading(false);
        setIsInitialized(true);
      }
    }, 3000); // 3 second timeout

    getInitialSession();

    return () => {
      mounted = false;
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, [updateProfile, isInitialized]);

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
      const redirectUrl = `${window.location.origin}/auth`;
      
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
      const redirectUrl = `${window.location.origin}/auth`;
      
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
