
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { Eye, EyeOff, Mail, Lock, User, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, user, session, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only attempt redirect if we have a valid authenticated user and haven't already attempted
    if (user && session?.access_token && !authLoading && !redirectAttempted) {
      console.log('Auth: User authenticated with valid session');
      console.log('Auth: Session access token exists:', !!session.access_token);
      console.log('Auth: User ID:', user.id);
      
      setRedirectAttempted(true);
      
      // Small delay to ensure session is fully established
      setTimeout(() => {
        // Check for saved publishers from SelectPublisher page
        const savedPublishers = localStorage.getItem('selectedPublishers');
        console.log('Auth: Checking for selectedPublishers in localStorage:', savedPublishers);
        
        if (savedPublishers) {
          try {
            const parsedPublishers = JSON.parse(savedPublishers);
            console.log('Auth: Found saved publishers:', parsedPublishers);
            
            if (Array.isArray(parsedPublishers) && parsedPublishers.length > 0) {
              console.log('Auth: Valid publishers found, redirecting to write-article');
              
              // Show success toast
              toast({
                title: "Welcome back!",
                description: `Continuing with ${parsedPublishers.length} selected publisher${parsedPublishers.length > 1 ? 's' : ''}`,
              });
              
              // Navigate to write-article with the selected publishers
              navigate('/write-article', { 
                state: { 
                  selectedPublishers: parsedPublishers,
                  fromAuth: true 
                },
                replace: true 
              });
              
              // Clear localStorage after successful navigation
              localStorage.removeItem('selectedPublishers');
              return;
            } else {
              console.log('Auth: Invalid publishers array, cleaning up localStorage');
              localStorage.removeItem('selectedPublishers');
            }
          } catch (error) {
            console.error('Auth: Error parsing saved publishers:', error);
            localStorage.removeItem('selectedPublishers');
          }
        }
        
        // No valid saved publishers, redirect to dashboard
        console.log('Auth: No saved publishers, redirecting to dashboard');
        toast({
          title: "Welcome back!",
          description: "You're now signed in to your account.",
        });
        navigate('/dashboard', { replace: true });
      }, 200);
    }
  }, [user, session, authLoading, navigate, redirectAttempted, toast]);

  // Reset redirect attempt when user changes (e.g., logout)
  useEffect(() => {
    if (!user) {
      setRedirectAttempted(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        console.log('Auth: Attempting email/password login');
        result = await signIn(email, password);
      } else {
        console.log('Auth: Attempting email/password signup');
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        console.error('Auth error:', result.error);
        toast({
          title: "Authentication Error",
          description: result.error.message || "An authentication error occurred. Please try again.",
          variant: "destructive",
        });
      } else if (!isLogin) {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account before signing in.",
        });
        setIsLogin(true); // Switch to login mode after successful signup
      }
      // For successful login, the useEffect will handle the redirect
    } catch (error) {
      console.error('Unexpected auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Auth: Google sign in initiated');
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Google Sign In Error",
          description: error.message || "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      } else {
        console.log('Auth: Google OAuth redirect initiated');
        toast({
          title: "Redirecting...",
          description: "Redirecting to Google for authentication",
        });
        // Don't set loading to false - user will be redirected
      }
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Google sign in. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Check if user came from publisher selection
  const hasSelectedPublishers = localStorage.getItem('selectedPublishers');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ArticleAI
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {hasSelectedPublishers 
              ? (isLogin ? 'Sign in to Continue' : 'Create Account to Continue')
              : (isLogin ? 'Welcome Back' : 'Create Account')
            }
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {hasSelectedPublishers 
              ? 'Sign in to proceed with your selected publishers'
              : (isLogin 
                  ? 'Sign in to your account to continue' 
                  : 'Join us and start creating amazing articles'
                )
            }
          </p>
        </div>

        <Card className="p-6 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  required
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full mt-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={loading}
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
