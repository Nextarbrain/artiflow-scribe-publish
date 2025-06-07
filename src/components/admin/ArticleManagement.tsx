
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { FileText, User, Building2, DollarSign, Calendar, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ArticleManagement = () => {
  const { articles, loading, fetchArticles, updateArticleStatus } = useAdminManagement();

  useEffect(() => {
    fetchArticles();
  }, []);

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      published: "default",
      draft: "secondary",
      rejected: "destructive",
      pending: "secondary"
    };
    return <Badge variant={variants[status || 'draft'] || "secondary"}>{status || 'draft'}</Badge>;
  };

  const getPaymentStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      unpaid: "secondary",
      failed: "destructive",
      pending: "secondary"
    };
    return <Badge variant={variants[status || 'unpaid'] || "secondary"}>{status || 'unpaid'}</Badge>;
  };

  const handleStatusChange = async (articleId: string, newStatus: string) => {
    await updateArticleStatus(articleId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and manage all articles on the platform</p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Publisher</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No articles found
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium line-clamp-1">{article.title}</div>
                        <div className="text-sm text-gray-500">
                          {article.content.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{article.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{article.profiles?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.publishers ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {article.publishers.name}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(article.payment_status)}</TableCell>
                  <TableCell>
                    {article.total_cost ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {article.total_cost}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={article.status || 'draft'}
                        onValueChange={(value) => handleStatusChange(article.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ArticleManagement;
