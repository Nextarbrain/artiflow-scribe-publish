
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { Sparkles, Brain, Zap, Loader2 } from 'lucide-react';

interface AIGenerationProps {
  onContentGenerated: (content: string, title: string) => void;
  initialTopic?: string;
}

const AIGeneration: React.FC<AIGenerationProps> = ({ onContentGenerated, initialTopic = '' }) => {
  const { generateArticle, generateFromImage, isGenerating } = useAIGeneration();
  const [topic, setTopic] = useState(initialTopic);
  const [imageDescription, setImageDescription] = useState('');
  const [generationMode, setGenerationMode] = useState<'topic' | 'image'>('topic');

  const handleGenerate = async () => {
    if (!topic.trim() && generationMode === 'topic') return;
    if (!imageDescription.trim() && generationMode === 'image') return;

    const result = generationMode === 'topic' 
      ? await generateArticle(topic)
      : await generateFromImage(imageDescription);

    if (result) {
      // Extract title from content (assuming it's the first line)
      const lines = result.content.split('\n').filter(line => line.trim());
      const title = lines[0]?.replace(/^#\s*/, '') || topic || 'Generated Article';
      const content = result.content;
      
      onContentGenerated(content, title);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Content Generator
        </CardTitle>
        <CardDescription>
          Generate high-quality articles using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Mode Selection */}
        <div className="space-y-2">
          <Label>Generation Mode</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={generationMode === 'topic' ? 'default' : 'outline'}
              onClick={() => setGenerationMode('topic')}
              className="flex-1"
            >
              Topic-based
            </Button>
            <Button
              type="button"
              variant={generationMode === 'image' ? 'default' : 'outline'}
              onClick={() => setGenerationMode('image')}
              className="flex-1"
            >
              Image-based
            </Button>
          </div>
        </div>

        {/* Topic Input */}
        {generationMode === 'topic' && (
          <div className="space-y-2">
            <Label htmlFor="topic">Article Topic</Label>
            <Input
              id="topic"
              placeholder="Enter the topic you want to write about..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        )}

        {/* Image Description Input */}
        {generationMode === 'image' && (
          <div className="space-y-2">
            <Label htmlFor="imageDescription">Image Description</Label>
            <Textarea
              id="imageDescription"
              placeholder="Describe the image you want to write about..."
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={
            isGenerating || 
            (generationMode === 'topic' && !topic.trim()) ||
            (generationMode === 'image' && !imageDescription.trim())
          }
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Article
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p>💡 The AI will create a structured article with title, introduction, main content, and conclusion.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGeneration;
