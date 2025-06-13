
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './ImageUpload';
import SimpleAIGeneration from './SimpleAIGeneration';
import { Save, Eye, FileText } from 'lucide-react';

const ArticleForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    status: 'draft',
    featured_image_url: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'general', 'technology', 'business', 'health', 'science', 
    'entertainment', 'sports', 'travel', 'food', 'lifestyle'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, featured_image_url: url }));
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, featured_image_url: '' }));
  };

  const handleAIContentGenerated = (content: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      title: title,
      content: content,
      excerpt: generateExcerpt(content)
    }));
    
    toast({
      title: "AI Content Generated",
      description: "Article content has been generated successfully!",
    });
  };

  const generateExcerpt = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create articles.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the title and content",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const excerpt = formData.excerpt || generateExcerpt(formData.content);
      
      const { error } = await supabase
        .from('articles')
        .insert({
          ...formData,
          excerpt,
          status,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${status === 'published' ? 'published' : 'saved as draft'} successfully`,
      });

      navigate('/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to create articles.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Article
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your knowledge with the world
        </p>
      </div>

      {/* AI Article Generator */}
      <SimpleAIGeneration 
        onContentGenerated={handleAIContentGenerated}
        initialTopic=""
      />

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              placeholder="Enter article title..."
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImage={formData.featured_image_url}
              onRemoveImage={handleRemoveImage}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Excerpt (optional)
            </label>
            <Textarea
              placeholder="Brief description of your article..."
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              If left empty, we'll generate one from your content
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              placeholder="Write your article content here..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={15}
              className="min-h-[300px]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish Article
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ArticleForm;
