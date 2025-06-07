
import React from 'react';
import { Card } from '@/components/ui/card';
import { useModerationData } from './moderation/useModerationData';
import ModerationTable from './moderation/ModerationTable';

const ContentModeration = () => {
  const { moderationItems, loading, moderateContent } = useModerationData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate user-generated content</p>
        </div>
      </div>

      <Card>
        <ModerationTable 
          moderationItems={moderationItems}
          loading={loading}
          onModerate={moderateContent}
        />
      </Card>
    </div>
  );
};

export default ContentModeration;
