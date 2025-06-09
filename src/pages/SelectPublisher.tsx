
import React, { useState, useEffect } from 'react';
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
import { saveUserSession, getUserSession } from '@/utils/sessionStorage';

const SelectPublisher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: publishers, isLoading, error } = usePublishers();
  const { toast } = useToast();
  const [selectedPublishers, setSelectedPublishers] = useState<Publisher[]>([]);

  // Restore selected publishers on component mount
  useEffect(() => {
    console.log('SelectPublisher: Component mounted, checking for saved session');
    const savedSession = getUserSession();
    if (savedSession?.selectedPublishers) {
      console.log('SelectPublisher: Restoring selected publishers from session:', savedSession.selectedPublishers.length);
      setSelectedPublishers(savedSession.selectedPublishers);
    } else {
      console.log('SelectPublisher: No saved publishers found');
    }
  }, []);

  const handlePublisherToggle = (publisher: Publisher, checked: boolean) => {
    let updatedPublishers: Publisher[];
    
    if (checked) {
      updatedPublishers = [...selectedPublishers, publisher];
    } else {
      updatedPublishers = selectedPublishers.filter(p => p.id !== publisher.id);
    }
    
    console.log('SelectPublisher: Updated publishers:', updatedPublishers.length);
    setSelectedPublishers(updatedPublishers);
    
    // Save to session storage immediately
    saveUserSession({
      selectedPublishers: updatedPublishers,
      currentRoute: '/select-publisher'
    });
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

    console.log('SelectPublisher: Continue clicked with publishers:', selectedPublishers.length);

    if (!user) {
      // Save complete session before redirecting to auth
      console.log('SelectPublisher: User not logged in, saving session and redirecting to auth');
      saveUserSession({
        selectedPublishers,
        currentRoute: '/select-publisher'
      });
      
      toast({
        title: "Login Required",
        description: `Please sign in to continue with your ${selectedPublishers.length} selected publisher${selectedPublishers.length > 1 ? 's' : ''}.`,
      });
      
      navigate('/auth');
      return;
    }

    // User is logged in, proceed directly to article creation
    console.log('SelectPublisher: User logged in, saving session and navigating to write-article');
    saveUserSession({
      selectedPublishers,
      currentRoute: '/write-article'
    });
    
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
