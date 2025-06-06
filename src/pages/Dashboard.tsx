
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { BookOpen, Plus, User, FileText, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const getDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const quickActions = [
    {
      title: 'Create Article',
      description: 'Start writing a new article',
      icon: Plus,
      onClick: () => navigate('/create-article'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Browse Articles',
      description: 'Explore all published articles',
      icon: BookOpen,
      onClick: () => navigate('/articles'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'My Articles',
      description: 'View your published articles',
      icon: FileText,
      onClick: () => navigate('/articles', { state: { filter: 'my' } }),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Profile Settings',
      description: 'Manage your profile',
      icon: User,
      onClick: () => navigate('/profile'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <>
      <Header />
      <div className="container max-w-6xl py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {getDisplayName()}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your personalized dashboard to manage your articles and profile.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer transition-all hover:shadow-lg" onClick={action.onClick}>
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Articles you've created
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Profile page visits
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles Read</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Articles you've read
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity yet</p>
              <p className="text-sm">Start by creating your first article!</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/create-article')}
              >
                Create Article
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
