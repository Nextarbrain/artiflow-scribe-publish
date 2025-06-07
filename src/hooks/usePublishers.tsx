
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Publisher {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  audience_size: number | null;
  category: string | null;
  price_per_article: number;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const usePublishers = () => {
  return useQuery({
    queryKey: ['publishers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publishers')
        .select('*')
        .order('price_per_article', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Publisher[];
    },
  });
};
