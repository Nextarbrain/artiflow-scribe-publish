
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, DollarSign, Building2, TrendingUp, Calendar } from 'lucide-react';

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  totalArticles: number;
  publishedArticles: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalPublishers: number;
  activePublishers: number;
}

const AdminStats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalArticles: 0,
    publishedArticles: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPublishers: 0,
    activePublishers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get user stats
      const { data: users } = await supabase
        .from('profiles')
        .select('status');

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.status === 'active').length || 0;

      // Get article stats
      const { data: articles } = await supabase
        .from('articles')
        .select('status');

      const totalArticles = articles?.length || 0;
      const publishedArticles = articles?.filter(a => a.status === 'published').length || 0;

      // Get publisher stats
      const { data: publishers } = await supabase
        .from('publishers')
        .select('status');

      const totalPublishers = publishers?.length || 0;
      const activePublishers = publishers?.filter(p => p.status === 'active').length || 0;

      // Get payment stats
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, status');

      const totalRevenue = payments?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0) || 0;

      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const monthlyRevenue = payments?.filter(p => 
        p.status === 'completed' && new Date(p.created_at) >= firstDayOfMonth
      ).reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalArticles,
        publishedArticles,
        totalRevenue,
        monthlyRevenue,
        totalPublishers,
        activePublishers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = "blue" 
  }: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: any;
    trend?: string;
    color?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}</span>
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">Key metrics and performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle={`${stats.activeUsers} active`}
          icon={Users}
          color="blue"
        />
        
        <StatCard
          title="Total Articles"
          value={stats.totalArticles.toLocaleString()}
          subtitle={`${stats.publishedArticles} published`}
          icon={FileText}
          color="green"
        />
        
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle={`$${stats.monthlyRevenue} this month`}
          icon={DollarSign}
          color="yellow"
        />
        
        <StatCard
          title="Publishers"
          value={stats.totalPublishers.toLocaleString()}
          subtitle={`${stats.activePublishers} active`}
          icon={Building2}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="User Growth"
          value={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%`}
          subtitle="Active user rate"
          icon={TrendingUp}
          color="blue"
        />
        
        <StatCard
          title="Publish Rate"
          value={`${((stats.publishedArticles / stats.totalArticles) * 100).toFixed(1)}%`}
          subtitle="Articles published"
          icon={FileText}
          color="green"
        />
        
        <StatCard
          title="Avg Revenue"
          value={`$${stats.totalArticles > 0 ? (stats.totalRevenue / stats.totalArticles).toFixed(0) : 0}`}
          subtitle="Per article"
          icon={DollarSign}
          color="yellow"
        />
        
        <StatCard
          title="Publisher Rate"
          value={`${((stats.activePublishers / stats.totalPublishers) * 100).toFixed(1)}%`}
          subtitle="Active publishers"
          icon={Building2}
          color="purple"
        />
      </div>
    </div>
  );
};

export default AdminStats;
