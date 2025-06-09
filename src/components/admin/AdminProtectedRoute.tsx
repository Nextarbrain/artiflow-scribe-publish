
import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold">Admin Access Required</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              You must be logged in as an administrator to access this area.
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={() => navigate('/admin/login')} 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              Return to Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
