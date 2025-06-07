
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { ContentModerationItem } from './types';
import ModerationStatus from './ModerationStatus';
import ModerationDialog from './ModerationDialog';

interface ModerationTableProps {
  moderationItems: ContentModerationItem[];
  loading: boolean;
  onModerate: (itemId: string, status: 'approved' | 'rejected', feedback?: string) => void;
}

const ModerationTable = ({ moderationItems, loading, onModerate }: ModerationTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Article</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Moderator</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </TableCell>
          </TableRow>
        ) : moderationItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No content pending moderation
            </TableCell>
          </TableRow>
        ) : (
          moderationItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="max-w-xs">
                  <div className="font-medium truncate">{item.articles?.title || 'Untitled'}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {item.articles?.content.substring(0, 100)}...
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
              <TableCell>
                {item.moderator_id ? (
                  <div className="text-sm">
                    Moderated {item.moderated_at && formatDistanceToNow(new Date(item.moderated_at), { addSuffix: true })}
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <ModerationDialog item={item} onModerate={onModerate} />
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
