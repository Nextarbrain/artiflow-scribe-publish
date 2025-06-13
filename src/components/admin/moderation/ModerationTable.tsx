
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ContentModerationItem } from './types';
import ModerationStatus from './ModerationStatus';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface ModerationTableProps {
  items: ContentModerationItem[];
  onSelectItem: (item: ContentModerationItem) => void;
  onModerate: (itemId: string, status: 'approved' | 'rejected', feedback?: string) => Promise<void>;
  showAll?: boolean;
}

const ModerationTable = ({ items, onSelectItem, onModerate, showAll = false }: ModerationTableProps) => {
  const handleQuickModerate = async (item: ContentModerationItem, status: 'approved' | 'rejected') => {
    await onModerate(item.id, status);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Article</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          {showAll && <TableHead>Moderator</TableHead>}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showAll ? 6 : 5} className="text-center py-8 text-gray-500">
              No content found
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="max-w-xs">
                  <div className="font-medium truncate">{item.articles?.title || 'Untitled'}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {item.articles?.content?.substring(0, 100)}...
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.articles?.profiles?.full_name || 'Unknown User'}</div>
                  <div className="text-sm text-gray-500">{item.articles?.profiles?.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <ModerationStatus status={item.status} />
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </div>
              </TableCell>
              {showAll && (
                <TableCell>
                  {item.moderator_id ? (
                    <div className="text-sm">
                      Moderated {item.moderated_at && formatDistanceToNow(new Date(item.moderated_at), { addSuffix: true })}
                    </div>
                  ) : '-'}
                </TableCell>
              )}
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectItem(item)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {item.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleQuickModerate(item, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleQuickModerate(item, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ModerationTable;
