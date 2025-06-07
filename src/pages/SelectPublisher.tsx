
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePublishers } from '@/hooks/usePublishers';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, DollarSign, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SelectPublisher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: publishers, isLoading, error } = usePublishers();
  const { toast } = useToast();
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);

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

  const handleSelectPublisher = (publisherId: string) => {
    if (!user) {
      // Store selected publisher in localStorage for after login
      localStorage.setItem('selectedPublisherId', publisherId);
      toast({
        title: "Login Required",
        description: "Please login to continue with article creation.",
      });
      navigate('/auth');
      return;
    }

    // User is logged in, proceed to article creation
    navigate('/write-article', { state: { publisherId } });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container max-w-6xl py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading publishers...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container max-w-6xl py-10">
          <div className="text-center">
            <p className="text-red-600">Error loading publishers. Please try again.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container max-w-6xl py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Publisher
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Select from our network of trusted publishers to get your article published. 
            Each publisher has different audiences and pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishers?.map((publisher) => (
            <Card 
              key={publisher.id} 
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedPublisher === publisher.id 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setSelectedPublisher(publisher.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3 mb-3">
                  {publisher.logo_url && (
                    <img 
                      src={publisher.logo_url} 
                      alt={publisher.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{publisher.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {publisher.category}
                    </Badge>
                  </div>
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Price per article</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(publisher.price_per_article)}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPublisher(publisher.id);
                    }}
                  >
                    Select Publisher
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!user && (
          <div className="mt-8 text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              You'll need to login after selecting a publisher to continue with article creation.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SelectPublisher;
