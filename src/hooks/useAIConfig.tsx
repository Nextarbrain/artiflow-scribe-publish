
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIConfig {
  ai_enabled: boolean;
  default_provider: string;
  system_prompt: string;
  max_tokens: number;
  temperature: number;
  openai_api_key: string;
  openai_model: string;
  gemini_api_key: string;
  gemini_model: string;
  deepseek_api_key: string;
  deepseek_model: string;
}

export const useAIConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<Partial<AIConfig>>({});
  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_configurations')
        .select('key, value')
        .eq('category', 'ai');

      if (error) throw error;

      const configMap = data.reduce((acc, item) => {
        try {
          acc[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
        } catch {
          acc[item.key] = item.value;
        }
        return acc;
      }, {} as Record<string, any>);

      setConfig(configMap);
    } catch (error: any) {
      console.error('Error fetching AI config:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (prompt: string, options?: {
    provider?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('ai-content-generation', {
        body: {
          prompt,
          userId: user.id,
          ...options
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "AI Generation Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    refetch: fetchConfig,
    generateContent,
  };
};
