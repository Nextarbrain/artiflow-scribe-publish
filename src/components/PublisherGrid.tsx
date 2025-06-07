
import React from 'react';
import { Publisher } from '@/hooks/usePublishers';
import PublisherCard from './PublisherCard';

interface PublisherGridProps {
  publishers: Publisher[];
  selectedPublishers: Publisher[];
  onPublisherToggle: (publisher: Publisher, checked: boolean) => void;
}

const PublisherGrid = ({ publishers, selectedPublishers, onPublisherToggle }: PublisherGridProps) => {
  const isSelected = (publisherId: string) => {
    return selectedPublishers.some(p => p.id === publisherId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {publishers.map((publisher) => (
        <PublisherCard
          key={publisher.id}
          publisher={publisher}
          isSelected={isSelected(publisher.id)}
          onToggle={onPublisherToggle}
        />
      ))}
    </div>
  );
};

export default PublisherGrid;
