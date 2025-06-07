
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Publisher } from '@/hooks/usePublishers';
import { ShoppingCart, Users } from 'lucide-react';

interface StickyPricingSummaryProps {
  selectedPublishers: Publisher[];
  onContinue: () => void;
}

const StickyPricingSummary = ({ selectedPublishers, onContinue }: StickyPricingSummaryProps) => {
  const totalAmount = selectedPublishers.reduce((sum, publisher) => sum + publisher.price_per_article, 0);
  const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

  if (selectedPublishers.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="container max-w-6xl mx-auto p-4">
        <Card className="border-0 shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-lg">
                    {selectedPublishers.length} Publisher{selectedPublishers.length > 1 ? 's' : ''} Selected
                  </span>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedPublishers.map((publisher) => (
                    <div key={publisher.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{publisher.name}</span>
                      <span className="font-medium">{formatPrice(publisher.price_per_article)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:text-right">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  Total: {formatPrice(totalAmount)}
                </div>
                <Button 
                  size="lg" 
                  onClick={onContinue}
                  className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue ({selectedPublishers.length} publisher{selectedPublishers.length > 1 ? 's' : ''})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StickyPricingSummary;
