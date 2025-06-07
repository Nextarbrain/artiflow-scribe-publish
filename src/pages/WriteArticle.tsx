
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePublishers } from '@/hooks/usePublishers';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WriteArticle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: publishers } = usePublishers();
  const { toast } = useToast();

  const [publisherId, setPublisherId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);

  const selectedPublisher = publishers?.find(p => p.id === publisherId);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Get publisher ID from location state or localStorage
    const selectedPublisherId = location.state?.publisherId || localStorage.getItem('selectedPublisherId');
    
    if (!selectedPublisherId) {
      navigate('/select-publisher');
      return;
    }

    setPublisherId(selectedPublisherId);
    // Clear from localStorage once used
    localStorage.removeItem('selectedPublisherId');
  }, [user, location.state, navigate]);

  const saveArticle = async (stage: 'writing' | 'preview' = 'writing') => {
    if (!user || !publisherId) return null;

    setIsSaving(true);
    try {
      const articleData = {
        title: title || 'Untitled Article',
        content,
        excerpt,
        meta_description: metaDescription,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        user_id: user.id,
        publisher_id: publisherId,
        draft_stage: stage,
        total_cost: selectedPublisher?.price_per_article || 0,
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

      setCurrentArticleId(result.data.id);
      toast({
        title: "Article saved",
        description: "Your article has been saved as a draft.",
      });

      return result.data.id;
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
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
        title: "Missing content",
        description: "Please add a title and content before previewing.",
        variant: "destructive",
      });
      return;
    }

    const articleId = await saveArticle('preview');
    if (articleId) {
      navigate('/preview-article', { state: { articleId } });
    }
  };

  const handleSaveDraft = async () => {
    await saveArticle('writing');
  };

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

          {selectedPublisher && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Publishing to {selectedPublisher.name}</CardTitle>
                    <CardDescription>
                      Cost: ${(selectedPublisher.price_per_article / 100).toFixed(2)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{selectedPublisher.category}</Badge>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Write Your Article</CardTitle>
            <CardDescription>
              Create your article content. Don't worry, everything is automatically saved as you type.
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
