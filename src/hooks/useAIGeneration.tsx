
import { useState } from 'react';
import { useAIConfig } from '@/hooks/useAIConfig';
import { useToast } from '@/hooks/use-toast';

export const useAIGeneration = () => {
  const { generateContent, config } = useAIConfig();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateArticle = async (prompt: string, options?: {
    provider?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) => {
    if (!config.ai_enabled) {
      toast({
        title: "AI Disabled",
        description: "AI functionality is currently disabled by the administrator",
        variant: "destructive",
      });
      throw new Error('AI functionality is disabled');
    }

    try {
      setIsGenerating(true);
      const result = await generateContent(prompt, options);
      
      toast({
        title: "Article Generated",
        description: "Your article has been generated successfully",
      });
      
      return {
        title: extractTitle(result.content),
        content: result.content,
        provider: result.provider,
        model: result.model,
        usage: result.usage
      };
    } catch (error: any) {
      console.error('Article generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateArticle,
    isGenerating,
    aiEnabled: config.ai_enabled
  };
};

function extractTitle(content: string): string {
  const lines = content.split('\n');
  const titleLine = lines.find(line => 
    line.trim().startsWith('#') || 
    line.trim().length > 10 && line.trim().length < 100
  );
  
  if (titleLine) {
    return titleLine.replace(/^#+\s*/, '').trim();
  }
  
  return 'Generated Article';
}
