
import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminStats from '@/components/admin/AdminStats';
import UserManagement from '@/components/admin/UserManagement';
import ArticleManagement from '@/components/admin/ArticleManagement';
import PublisherManagement from '@/components/admin/PublisherManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import ContentModeration from '@/components/admin/ContentModeration';
import SystemSettings from '@/components/admin/SystemSettings';
import AIConfiguration from '@/components/admin/AIConfiguration';
import { Shield, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminStats />;
      case 'users':
        return <UserManagement />;
      case 'articles':
        return <ArticleManagement />;
      case 'publishers':
        return <PublisherManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'moderation':
        return <ContentModeration />;
      case 'settings':
        return <SystemSettings />;
      case 'ai':
        return <AIConfiguration />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your platform</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
