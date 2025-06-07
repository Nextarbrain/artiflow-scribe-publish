
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Publisher {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  price_per_article: number;
  audience_size: number | null;
  category: string | null;
  status: 'active' | 'inactive' | 'pending';
  contact_email: string | null;
  contact_person: string | null;
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  status: 'active' | 'suspended' | 'banned';
  last_login_at: string | null;
  email_verified: boolean | null;
  phone: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  status: string | null;
  user_id: string;
  publisher_id: string | null;
  total_cost: number | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  article_id: string;
  publisher_id: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useAdminManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // Publisher Management
  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publishers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublishers(data || []);
    } catch (error) {
      console.error('Error fetching publishers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch publishers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPublisher = async (publisherData: Partial<Publisher>) => {
    try {
      const { data, error } = await supabase
        .from('publishers')
        .insert(publisherData)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      if (user) {
        await supabase.rpc('log_admin_action', {
          _admin_user_id: user.id,
          _action: 'create',
          _resource_type: 'publisher',
          _resource_id: data.id,
          _new_values: publisherData
        });
      }

      toast({
        title: "Success",
        description: "Publisher created successfully",
      });

      await fetchPublishers();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating publisher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create publisher",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updatePublisher = async (id: string, updates: Partial<Publisher>) => {
    try {
      const { data, error } = await supabase
        .from('publishers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      if (user) {
        await supabase.rpc('log_admin_action', {
          _admin_user_id: user.id,
          _action: 'update',
          _resource_type: 'publisher',
          _resource_id: id,
          _new_values: updates
        });
      }

      toast({
        title: "Success",
        description: "Publisher updated successfully",
      });

      await fetchPublishers();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating publisher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update publisher",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deletePublisher = async (id: string) => {
    try {
      const { error } = await supabase
        .from('publishers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log admin action
      if (user) {
        await supabase.rpc('log_admin_action', {
          _admin_user_id: user.id,
          _action: 'delete',
          _resource_type: 'publisher',
          _resource_id: id
        });
      }

      toast({
        title: "Success",
        description: "Publisher deleted successfully",
      });

      await fetchPublishers();
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting publisher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete publisher",
        variant: "destructive",
      });
      return { error };
    }
  };

  // User Management
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'banned') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      if (user) {
        await supabase.rpc('log_admin_action', {
          _admin_user_id: user.id,
          _action: 'update_status',
          _resource_type: 'user',
          _resource_id: userId,
          _new_values: { status }
        });
      }

      toast({
        title: "Success",
        description: `User ${status} successfully`,
      });

      await fetchUsers();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // Article Management
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles!articles_user_id_fkey(full_name, email),
          publishers(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateArticleStatus = async (articleId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', articleId)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      if (user) {
        await supabase.rpc('log_admin_action', {
          _admin_user_id: user.id,
          _action: 'update_status',
          _resource_type: 'article',
          _resource_id: articleId,
          _new_values: { status }
        });
      }

      toast({
        title: "Success",
        description: "Article status updated successfully",
      });

      await fetchArticles();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating article status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update article status",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // Payment Management
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles!payments_user_id_fkey(full_name, email),
          publishers(name),
          articles(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      if (user) {
        await supabase.rpc('log_admin_action', {
          _admin_user_id: user.id,
          _action: 'update_status',
          _resource_type: 'payment',
          _resource_id: paymentId,
          _new_values: { status }
        });
      }

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });

      await fetchPayments();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  return {
    // Data
    publishers,
    users,
    articles,
    payments,
    loading,
    
    // Publisher methods
    fetchPublishers,
    createPublisher,
    updatePublisher,
    deletePublisher,
    
    // User methods
    fetchUsers,
    updateUserStatus,
    
    // Article methods
    fetchArticles,
    updateArticleStatus,
    
    // Payment methods
    fetchPayments,
    updatePaymentStatus,
  };
};
