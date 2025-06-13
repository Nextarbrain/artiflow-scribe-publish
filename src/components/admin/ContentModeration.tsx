import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModerationData } from './moderation/useModerationData';
import ModerationTable from './moderation/ModerationTable';
import ModerationDialog from './moderation/ModerationDialog';
import { FileText, Search, Filter } from 'lucide-react';
import { ContentModerationItem } from './moderation/types';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: 'pending' | 'approved' | 'rejected';
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

const ContentModeration = () => {
  const { moderationItems, loading, moderateContent, refetch } = useModerationData();
  const [selectedItem, setSelectedItem] = useState<ContentModerationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSelectItem = (item: ContentModerationItem) => {
    setSelectedItem(item);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleModerate = async (itemId: string, status: 'approved' | 'rejected', feedback?: string) => {
    await moderateContent(itemId, status, feedback);
    setSelectedItem(null);
  };

  // Filter moderation items
  const filteredItems = moderationItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.articles?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articles?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Separate items by status
  const pendingItems = filteredItems.filter(item => item.status === 'pending');
  const reviewedItems = filteredItems.filter(item => item.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-6 h-6" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate user-submitted articles</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search articles or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{moderationItems.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {moderationItems.filter(item => item.status === 'approved').length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {moderationItems.filter(item => item.status === 'rejected').length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="relative">
            Pending Review
            {pendingItems.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">All Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Pending Articles
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All articles have been reviewed. Great job!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ModerationTable
              items={pendingItems}
              onSelectItem={setSelectedItem}
              onModerate={handleModerate}
            />
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <ModerationTable
            items={filteredItems}
            onSelectItem={setSelectedItem}
            onModerate={handleModerate}
            showAll
          />
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      {selectedItem && (
        <ModerationDialog
          item={{
            ...selectedItem,
            status: selectedItem.status as 'pending' | 'approved' | 'rejected',
            articles: selectedItem.articles ? {
              ...selectedItem.articles,
              id: selectedItem.articles.id,
              excerpt: selectedItem.articles.excerpt,
              created_at: selectedItem.articles.created_at,
              profiles: selectedItem.articles.profiles
            } : null
          }}
          onClose={() => setSelectedItem(null)}
          onModerate={handleModerate}
        />
      )}
    </div>
  );
};

export default ContentModeration;
