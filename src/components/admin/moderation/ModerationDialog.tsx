
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { ContentModerationItem } from './types';

interface ModerationDialogProps {
  item: ContentModerationItem;
  onModerate: (itemId: string, status: 'approved' | 'rejected', feedback?: string) => void;
}

const ModerationDialog = ({ item, onModerate }: ModerationDialogProps) => {
  const [feedback, setFeedback] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleModerate = (status: 'approved' | 'rejected') => {
    onModerate(item.id, status, feedback);
    setFeedback('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{item.articles?.title}</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{item.articles?.content}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Feedback (optional)</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the author..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => handleModerate('rejected')}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleModerate('approved')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModerationDialog;
