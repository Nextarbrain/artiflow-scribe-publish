
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIUsageStats {
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  successRate: number;
  providerBreakdown: { provider: string; count: number; cost: number }[];
  dailyUsage: { date: string; requests: number; cost: number }[];
}

export const useAIAnalytics = (userId?: string) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async (dateRange: number = 30) => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      let query = supabase
        .from('ai_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const totalRequests = data.length;
        const successfulRequests = data.filter(log => log.success).length;
        const totalCost = data.reduce((sum, log) => sum + (log.estimated_cost || 0), 0);
        const totalTokens = data.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
        const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

        // Provider breakdown
        const providerMap = new Map();
        data.forEach(log => {
          const existing = providerMap.get(log.provider) || { count: 0, cost: 0 };
          providerMap.set(log.provider, {
            count: existing.count + 1,
            cost: existing.cost + (log.estimated_cost || 0)
          });
        });

        const providerBreakdown = Array.from(providerMap.entries()).map(([provider, stats]) => ({
          provider,
          count: stats.count,
          cost: stats.cost
        }));

        // Daily usage
        const dailyMap = new Map();
        data.forEach(log => {
          const date = new Date(log.created_at).toDateString();
          const existing = dailyMap.get(date) || { requests: 0, cost: 0 };
          dailyMap.set(date, {
            requests: existing.requests + 1,
            cost: existing.cost + (log.estimated_cost || 0)
          });
        });

        const dailyUsage = Array.from(dailyMap.entries()).map(([date, stats]) => ({
          date,
          requests: stats.requests,
          cost: stats.cost
        }));

        setStats({
          totalRequests,
          totalCost,
          totalTokens,
          successRate,
          providerBreakdown,
          dailyUsage
        });
      }
    } catch (error: any) {
      console.error('Error fetching AI analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  return {
    stats,
    loading,
    fetchAnalytics,
  };
};
