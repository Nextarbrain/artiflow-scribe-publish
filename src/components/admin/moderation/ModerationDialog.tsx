
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ContentModerationItem } from './types';
import { Eye, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ModerationDialogProps {
  item: ContentModerationItem;
  onClose: () => void;
  onModerate: (itemId: string, status: 'approved' | 'rejected', feedback?: string) => Promise<void>;
}

const ModerationDialog = ({ item, onClose, onModerate }: ModerationDialogProps) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleModerate = async (status: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    try {
      await onModerate(item.id, status, feedback.trim() || undefined);
      setOpen(false);
      onClose();
    } catch (error) {
      console.error('Error moderating content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Article Review
            <Badge className={getStatusColor(item.status)}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and moderate this article submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Article Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{item.articles?.profiles?.full_name || 'Unknown User'}</div>
                <div className="text-sm text-gray-500">{item.articles?.profiles?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">Submitted</div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Title</Label>
              <div className="mt-1 p-3 bg-white dark:bg-gray-900 border rounded-md">
                {item.articles?.title || 'Untitled Article'}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Content</Label>
              <div className="mt-1 p-3 bg-white dark:bg-gray-900 border rounded-md max-h-60 overflow-y-auto">
                <div className="whitespace-pre-wrap">{item.articles?.content}</div>
              </div>
            </div>

            {item.articles?.excerpt && (
              <div>
                <Label className="text-base font-semibold">Excerpt</Label>
                <div className="mt-1 p-3 bg-white dark:bg-gray-900 border rounded-md">
                  {item.articles.excerpt}
                </div>
              </div>
            )}
          </div>

          {/* Moderation Actions */}
          {item.status === 'pending' && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Add feedback for the author..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleModerate('approved')}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Processing...' : 'Approve Article'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleModerate('rejected')}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Processing...' : 'Reject Article'}
                </Button>
              </div>
            </div>
          )}

          {/* Previous Moderation Info */}
          {item.status !== 'pending' && item.feedback && (
            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Moderation Feedback</Label>
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 border rounded-md">
                {item.feedback}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModerationDialog;
