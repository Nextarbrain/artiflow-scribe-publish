
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface AIGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIGenerationResponse {
  content: string;
  provider: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  cost?: number;
}

export const useAIGeneration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneration, setLastGeneration] = useState<AIGenerationResponse | null>(null);

  const logAIUsage = async (response: AIGenerationResponse, articleId?: string, success: boolean = true, errorMessage?: string) => {
    if (!user) return;
    
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: user.id,
        article_id: articleId,
        provider: response.provider,
        model: response.model || 'unknown',
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
        estimated_cost: response.cost || 0,
        success,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error('Failed to log AI usage:', error);
    }
  };

  const generateContent = async (request: AIGenerationRequest): Promise<AIGenerationResponse | null> => {
    try {
      setIsGenerating(true);
      const startTime = Date.now();
      
      // Don't specify provider - let the edge function use admin-configured default
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: request
      });

      if (error) throw error;

      const duration = Date.now() - startTime;
      const response = { ...data, duration };
      
      setLastGeneration(response);
      
      // Log successful usage (without showing provider to user)
      await logAIUsage(response, undefined, true);
      
      toast({
        title: "Content Generated",
        description: "Successfully generated content using AI",
      });

      return response;
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      
      // Log failed usage
      await logAIUsage(
        { content: '', provider: 'unknown' }, 
        undefined, 
        false, 
        error.message
      );
      
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate AI content",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateArticle = async (topic: string) => {
    const prompt = `Create a comprehensive article about: ${topic}

Please structure the article with:
1. An engaging title
2. A brief introduction that hooks the reader
3. Main content divided into clear sections with subheadings
4. Practical examples or insights where relevant
5. A compelling conclusion
6. Suggested meta description for SEO

Make the content informative, well-researched, and engaging for readers.`;

    return await generateContent({
      prompt,
    });
  };

  const generateFromImage = async (imageDescription: string) => {
    const prompt = `Based on this image description: "${imageDescription}"

Create an engaging article that:
1. Analyzes what's shown in the image
2. Provides relevant context and background information
3. Discusses the significance or implications
4. Includes related insights or interesting facts
5. Concludes with key takeaways

Structure it with a compelling title, clear sections, and make it informative and engaging.`;

    return await generateContent({
      prompt,
    });
  };

  return {
    generateContent,
    generateArticle,
    generateFromImage,
    isGenerating,
    lastGeneration,
  };
};
