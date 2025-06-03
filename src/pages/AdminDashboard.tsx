
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, FileText, Shield, Settings, Crown, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0
  });
  const [demoEmail, setDemoEmail] = useState('admin@demo.com');
  const [creatingDemo, setCreatingDemo] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Get articles stats
      const { data: articles } = await supabase
        .from('articles')
        .select('status');

      // Get users count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      const publishedCount = articles?.filter(a => a.status === 'published').length || 0;
      const draftCount = articles?.filter(a => a.status === 'draft').length || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        totalArticles: articles?.length || 0,
        publishedArticles: publishedCount,
        draftArticles: draftCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createDemoAdmin = async () => {
    setCreatingDemo(true);
    try {
      // Create demo user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: demoEmail,
        password: 'demo123456',
        options: {
          data: {
            full_name: 'Demo Admin'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Add admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'admin'
          });

        if (roleError) throw roleError;

        toast({
          title: "Demo admin created",
          description: `Demo admin account created with email: ${demoEmail} and password: demo123456`,
        });
      }
    } catch (error: any) {
      console.error('Error creating demo admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create demo admin",
        variant: "destructive",
      });
    } finally {
      setCreatingDemo(false);
    }
  };

  if (adminLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Header />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Header />
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to access the admin dashboard.
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAdmin) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Header />
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have admin privileges to access this page.
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your ArticleAI platform
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUsers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Articles
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalArticles}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Published
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.publishedArticles}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">Live</Badge>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Drafts
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.draftArticles}
                  </p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
              </div>
            </Card>
          </div>

          {/* Demo Admin Creation */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Create Demo Admin</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create a demo admin account for testing purposes.
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Demo Admin Email</label>
                <Input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  placeholder="admin@demo.com"
                />
              </div>
              <Button 
                onClick={createDemoAdmin}
                disabled={creatingDemo || !demoEmail}
              >
                <Plus className="w-4 h-4 mr-2" />
                {creatingDemo ? 'Creating...' : 'Create Demo Admin'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Password will be set to: demo123456
            </p>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Review Articles
              </Button>
              <Button variant="outline" className="justify-start">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
