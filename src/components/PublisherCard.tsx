
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Globe, DollarSign } from 'lucide-react';
import { Publisher } from '@/hooks/usePublishers';

interface PublisherCardProps {
  publisher: Publisher;
  isSelected: boolean;
  onToggle: (publisher: Publisher, checked: boolean) => void;
}

const PublisherCard = ({ publisher, isSelected, onToggle }: PublisherCardProps) => {
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const formatAudienceSize = (size: number | null) => {
    if (!size) return 'N/A';
    if (size >= 1000000) {
      return `${(size / 1000000).toFixed(1)}M`;
    }
    if (size >= 1000) {
      return `${(size / 1000).toFixed(0)}K`;
    }
    return size.toString();
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onClick={() => onToggle(publisher, !isSelected)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            {publisher.logo_url && (
              <img 
                src={publisher.logo_url} 
                alt={publisher.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{publisher.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {publisher.category}
              </Badge>
            </div>
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onToggle(publisher, checked === true)}
            onClick={(e) => e.stopPropagation()}
            className="ml-2"
          />
        </div>
        <CardDescription className="text-sm">
          {publisher.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Audience</span>
          </div>
          <span className="font-medium">
            {formatAudienceSize(publisher.audience_size)}
          </span>
        </div>

        {publisher.website_url && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Website</span>
            </div>
            <a 
              href={publisher.website_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Visit
            </a>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Price per article</span>
            </div>
            <span className="text-xl font-bold text-green-600 ml-auto">
              {formatPrice(publisher.price_per_article)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublisherCard;
