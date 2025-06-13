
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SimpleAIGenerationProps {
  onContentGenerated: (content: string, title: string) => void;
  initialTopic: string;
}

const SimpleAIGeneration: React.FC<SimpleAIGenerationProps> = ({ 
  onContentGenerated, 
  initialTopic 
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateContent = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your article.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting AI generation for topic:', topic);
      
      // Call the AI generation function
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          prompt: `Write a comprehensive article about: ${topic}. Please structure it with a clear title, introduction, main content sections, and conclusion.`,
          type: 'article'
        }
      });

      console.log('AI generation response:', { data, error });

      if (error) {
        console.error('AI generation error:', error);
        setError(error.message || 'Failed to generate content');
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate content. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.content || data?.generatedText) {
        const content = data.content || data.generatedText;
        
        // Extract title and content from generated text
        const lines = content.split('\n').filter(line => line.trim());
        const titleLine = lines.find(line => 
          line.toLowerCase().includes('title') || 
          line.startsWith('#') || 
          lines.indexOf(line) === 0
        );
        
        let title = titleLine?.replace(/^#\s*/, '').replace(/.*?title.*?:\s*/i, '') || `Article about ${topic}`;
        title = title.trim();
        
        // Remove title from content if it was extracted
        let articleContent = content;
        if (titleLine) {
          articleContent = content.replace(titleLine, '').trim();
        }
        
        onContentGenerated(articleContent, title);
        
        toast({
          title: "Content Generated!",
          description: `Your AI-generated article "${title}" is ready.`,
        });
      } else {
        throw new Error('No content received from AI service');
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Article Generator
        </CardTitle>
        <CardDescription>
          Generate article content using AI based on your topic
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Article Topic</label>
          <Input
            placeholder="Enter your article topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <Button 
          onClick={generateContent} 
          disabled={loading || !topic.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Article
            </>
          )}
        </Button>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p>💡 Make sure AI is enabled in the admin settings and the appropriate API keys are configured.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAIGeneration;
