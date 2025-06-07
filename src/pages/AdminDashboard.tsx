
import React, { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import AdminStats from '@/components/admin/AdminStats';
import PublisherManagement from '@/components/admin/PublisherManagement';
import UserManagement from '@/components/admin/UserManagement';
import ArticleManagement from '@/components/admin/ArticleManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import { Crown, BarChart3, Building2, Users, FileText, CreditCard, Settings, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete platform management and analytics
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="publishers" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Publishers
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminStats />
            </TabsContent>

            <TabsContent value="publishers">
              <PublisherManagement />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="articles">
              <ArticleManagement />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentManagement />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  System configuration settings will be implemented here.
                </p>
                <div className="mt-4 space-y-4">
                  <Button variant="outline">Platform Configuration</Button>
                  <Button variant="outline">Email Settings</Button>
                  <Button variant="outline">Payment Configuration</Button>
                  <Button variant="outline">Security Settings</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
