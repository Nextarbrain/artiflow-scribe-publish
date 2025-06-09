
import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminStats from '@/components/admin/AdminStats';
import UserManagement from '@/components/admin/UserManagement';
import ArticleManagement from '@/components/admin/ArticleManagement';
import PublisherManagement from '@/components/admin/PublisherManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import ContentModeration from '@/components/admin/ContentModeration';
import SystemSettings from '@/components/admin/SystemSettings';
import AIConfiguration from '@/components/admin/AIConfiguration';
import AIAnalytics from '@/components/admin/AIAnalytics';

const AdminDashboard = () => {
  const { isAuthenticated } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) {
    return null; // AdminProtectedRoute will handle this
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
      case 'ai-analytics':
        return <AIAnalytics />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
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
