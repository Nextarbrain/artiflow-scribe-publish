
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIGenerationRequest {
  prompt: string;
  provider?: 'openai' | 'gemini' | 'deepseek';
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIGenerationResponse {
  content: string;
  provider: string;
}

export const useAIGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneration, setLastGeneration] = useState<AIGenerationResponse | null>(null);

  const generateContent = async (request: AIGenerationRequest): Promise<AIGenerationResponse | null> => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: request
      });

      if (error) throw error;

      setLastGeneration(data);
      
      toast({
        title: "Content Generated",
        description: `Successfully generated content using ${data.provider}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error generating AI content:', error);
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

  const generateArticle = async (topic: string, provider?: string) => {
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
      provider: provider as any,
    });
  };

  const generateFromImage = async (imageDescription: string, provider?: string) => {
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
      provider: provider as any,
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
