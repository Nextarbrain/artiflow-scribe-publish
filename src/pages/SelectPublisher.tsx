
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePublishers, Publisher } from '@/hooks/usePublishers';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import StickyPricingSummary from '@/components/StickyPricingSummary';
import PublisherSelectionHeader from '@/components/PublisherSelectionHeader';
import PublisherGrid from '@/components/PublisherGrid';
import LoginPrompt from '@/components/LoginPrompt';
import LoadingSpinner from '@/components/LoadingSpinner';

const SelectPublisher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: publishers, isLoading, error } = usePublishers();
  const { toast } = useToast();
  const [selectedPublishers, setSelectedPublishers] = useState<Publisher[]>([]);

  const handlePublisherToggle = (publisher: Publisher, checked: boolean) => {
    if (checked) {
      setSelectedPublishers(prev => [...prev, publisher]);
    } else {
      setSelectedPublishers(prev => prev.filter(p => p.id !== publisher.id));
    }
  };

  const handleContinue = () => {
    if (selectedPublishers.length === 0) {
      toast({
        title: "No Publishers Selected",
        description: "Please select at least one publisher to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      // Store selected publishers in localStorage for after login
      console.log('SelectPublisher: User not logged in, saving publishers to localStorage:', selectedPublishers);
      localStorage.setItem('selectedPublishers', JSON.stringify(selectedPublishers));
      
      toast({
        title: "Login Required",
        description: `Please sign in to continue with your ${selectedPublishers.length} selected publisher${selectedPublishers.length > 1 ? 's' : ''}.`,
      });
      
      // Navigate to auth page
      navigate('/auth');
      return;
    }

    // User is logged in, proceed directly to article creation
    console.log('SelectPublisher: User logged in, navigating to write-article');
    toast({
      title: "Ready to Write!",
      description: `Proceeding with ${selectedPublishers.length} selected publisher${selectedPublishers.length > 1 ? 's' : ''}.`,
    });
    
    navigate('/write-article', { 
      state: { 
        selectedPublishers,
        fromSelection: true 
      } 
    });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container max-w-6xl py-10">
          <LoadingSpinner message="Loading publishers..." />
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
      <div className="container max-w-6xl py-10 pb-32">
        <PublisherSelectionHeader />

        <PublisherGrid 
          publishers={publishers || []}
          selectedPublishers={selectedPublishers}
          onPublisherToggle={handlePublisherToggle}
        />

        {!user && selectedPublishers.length > 0 && (
          <LoginPrompt />
        )}
      </div>

      <StickyPricingSummary 
        selectedPublishers={selectedPublishers}
        onContinue={handleContinue}
      />
    </>
  );
};

export default SelectPublisher;
