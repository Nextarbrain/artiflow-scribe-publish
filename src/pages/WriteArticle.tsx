
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Publisher } from '@/hooks/usePublishers';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WriteArticle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedPublishers, setSelectedPublishers] = useState<Publisher[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalAmount = selectedPublishers.reduce((sum, publisher) => sum + publisher.price_per_article, 0);
  const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

  useEffect(() => {
    console.log('WriteArticle: Component mounted');
    console.log('WriteArticle: User authenticated:', !!user);
    console.log('WriteArticle: Location state:', location.state);
    
    if (!user) {
      console.log('WriteArticle: No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    const restorePublishers = () => {
      console.log('WriteArticle: Starting publisher restoration');
      
      // Priority 1: Publishers from navigation state (preferred method)
      if (location.state?.selectedPublishers && Array.isArray(location.state.selectedPublishers)) {
        const statePublishers = location.state.selectedPublishers;
        console.log('WriteArticle: Found publishers in navigation state:', statePublishers.length);
        
        if (statePublishers.length > 0) {
          console.log('WriteArticle: Using publishers from navigation state');
          setSelectedPublishers(statePublishers);
          setIsLoading(false);
          
          // Show welcome message based on source
          if (location.state.fromAuth) {
            toast({
              title: "Welcome back!",
              description: `Ready to write for ${statePublishers.length} publisher${statePublishers.length > 1 ? 's' : ''}`,
            });
          }
          return true;
        }
      }

      // Priority 2: Check localStorage as fallback
      console.log('WriteArticle: Checking localStorage for publishers');
      const savedPublishers = localStorage.getItem('selectedPublishers');
      
      if (savedPublishers) {
        try {
          const parsedPublishers = JSON.parse(savedPublishers);
          console.log('WriteArticle: Found publishers in localStorage:', parsedPublishers.length);
          
          if (Array.isArray(parsedPublishers) && parsedPublishers.length > 0) {
            console.log('WriteArticle: Using publishers from localStorage');
            setSelectedPublishers(parsedPublishers);
            setIsLoading(false);
            
            // Clean up localStorage after successful use
            localStorage.removeItem('selectedPublishers');
            console.log('WriteArticle: Cleaned localStorage after restoration');
            
            toast({
              title: "Publishers Restored",
              description: `Ready to write for ${parsedPublishers.length} publisher${parsedPublishers.length > 1 ? 's' : ''}`,
            });
            return true;
          }
        } catch (error) {
          console.error('WriteArticle: Error parsing localStorage publishers:', error);
          localStorage.removeItem('selectedPublishers');
        }
      }

      // No publishers found - redirect to selection
      console.log('WriteArticle: No publishers found, redirecting to select-publisher');
      toast({
        title: "No Publishers Selected",
        description: "Please select publishers to write for.",
        variant: "destructive",
      });
      navigate('/select-publisher');
      return false;
    };

    // Restore publishers
    restorePublishers();
  }, [user, location.state, navigate, toast]);

  const saveArticle = async (stage: 'writing' | 'preview' = 'writing') => {
    if (!user || selectedPublishers.length === 0) return null;

    setIsSaving(true);
    try {
      const articleData = {
        title: title || 'Untitled Article',
        content,
        excerpt,
        meta_description: metaDescription,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        user_id: user.id,
        draft_stage: stage,
        total_cost: totalAmount,
        status: 'draft'
      };

      let result;
      if (currentArticleId) {
        // Update existing article
        result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', currentArticleId)
          .select()
          .single();
      } else {
        // Create new article
        result = await supabase
          .from('articles')
          .insert(articleData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const articleId = result.data.id;
      setCurrentArticleId(articleId);

      // Save article-publisher relationships
      if (!currentArticleId) {
        // Only create relationships for new articles
        const articlePublisherData = selectedPublishers.map(publisher => ({
          article_id: articleId,
          publisher_id: publisher.id,
          cost: publisher.price_per_article
        }));

        const { error: relationError } = await supabase
          .from('article_publishers')
          .insert(articlePublisherData);

        if (relationError) throw relationError;
      }

      toast({
        title: "Article Saved",
        description: "Your article has been saved as a draft.",
      });

      return articleId;
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please add a title and content before previewing.",
        variant: "destructive",
      });
      return;
    }

    const articleId = await saveArticle('preview');
    if (articleId) {
      navigate('/preview-article', { state: { articleId, selectedPublishers } });
    }
  };

  const handleSaveDraft = async () => {
    await saveArticle('writing');
  };

  // Show loading state while restoring publishers
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container max-w-4xl py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Setting up your article...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/select-publisher')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publishers
          </Button>

          {selectedPublishers.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Publishing to {selectedPublishers.length} Publisher{selectedPublishers.length > 1 ? 's' : ''}
                    </CardTitle>
                    <CardDescription>
                      Total Cost: {formatPrice(totalAmount)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {selectedPublishers.map(publisher => (
                    <Badge key={publisher.id} variant="outline" className="flex items-center gap-1">
                      {publisher.name} - {formatPrice(publisher.price_per_article)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Write Your Article</CardTitle>
            <CardDescription>
              Create engaging content for your selected publishers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of your article..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="content">Article Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                className="mt-1 min-h-96"
                rows={20}
              />
            </div>

            <div>
              <Label htmlFor="meta-description">Meta Description (Optional)</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3..."
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSaveDraft}
                variant="outline"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button 
                onClick={handlePreview}
                disabled={!title.trim() || !content.trim() || isSaving}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Article
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WriteArticle;
