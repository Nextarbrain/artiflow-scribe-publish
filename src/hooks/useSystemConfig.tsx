
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemConfiguration {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string | null;
  is_sensitive: boolean;
  created_at: string;
  updated_at: string;
}

export const useSystemConfig = () => {
  const { toast } = useToast();
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error: any) {
      console.error('Error fetching configurations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (id: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_configurations')
        .update({ 
          value: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });

      await fetchConfigurations();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating configuration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
      return { error };
    }
  };

  const getConfigValue = (category: string, key: string) => {
    const config = configurations.find(c => c.category === category && c.key === key);
    return config?.value;
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    loading,
    fetchConfigurations,
    updateConfiguration,
    getConfigValue,
  };
};
