
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
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
    try {
      // Call the AI generation function without specifying provider - let admin settings decide
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          prompt: `Write a comprehensive article about: ${topic}`,
          type: 'article'
        }
      });

      if (error) {
        console.error('AI generation error:', error);
        toast({
          title: "Generation Failed",
          description: "Failed to generate content. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.generatedText) {
        // Extract title and content from generated text
        const lines = data.generatedText.split('\n');
        const title = lines[0]?.replace(/^#\s*/, '') || `Article about ${topic}`;
        const content = lines.slice(1).join('\n').trim() || data.generatedText;
        
        onContentGenerated(content, title);
        
        toast({
          title: "Content Generated!",
          description: "Your AI-generated article is ready.",
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
      </CardContent>
    </Card>
  );
};

export default SimpleAIGeneration;
