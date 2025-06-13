
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { Sparkles, Wand2 } from 'lucide-react';

interface AIArticleGeneratorProps {
  onGenerated: (content: { title: string; content: string; excerpt: string; metaDescription: string; tags: string }) => void;
}

const AIArticleGenerator = ({ onGenerated }: AIArticleGeneratorProps) => {
  const [topic, setTopic] = useState('');
  const [provider, setProvider] = useState('openai');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const { generateContent, isGenerating } = useAIGeneration();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const lengthMap = {
      short: '500-800 words',
      medium: '800-1200 words',
      long: '1200-2000 words'
    };

    const prompt = `Write a comprehensive ${tone} article about: ${topic}

Article requirements:
- Length: ${lengthMap[length as keyof typeof lengthMap]}
- Tone: ${tone}
${keywords ? `- Include these keywords naturally: ${keywords}` : ''}

Please structure the article with:
1. An engaging title (50-60 characters)
2. A compelling excerpt/summary (150-160 characters)
3. Well-structured content with headings and subheadings
4. A meta description for SEO (150-160 characters)
5. Relevant tags (comma-separated)

Format your response as JSON with these exact keys:
{
  "title": "Article title here",
  "content": "Full article content with proper formatting",
  "excerpt": "Brief article summary",
  "metaDescription": "SEO meta description",
  "tags": "tag1, tag2, tag3"
}`;

    const result = await generateContent({
      prompt,
      provider: provider as any,
      maxTokens: 2000,
      temperature: 0.7
    });

    if (result?.content) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(result.content);
        onGenerated(parsed);
      } catch (e) {
        // If not JSON, extract content manually
        const lines = result.content.split('\n');
        const title = lines.find(line => line.toLowerCase().includes('title'))?.replace(/.*?[:]\s*/, '') || topic;
        
        onGenerated({
          title: title,
          content: result.content,
          excerpt: `AI-generated article about ${topic}`,
          metaDescription: `Learn about ${topic} in this comprehensive article`,
          tags: keywords || 'ai-generated, article'
        });
      }
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
          Generate high-quality articles using AI to get started quickly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="topic">Article Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Benefits of Remote Work"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="keywords">Keywords (Optional)</Label>
          <Input
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., productivity, remote work, collaboration"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tone">Writing Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="length">Article Length</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (500-800 words)</SelectItem>
                <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                <SelectItem value="long">Long (1200-2000 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Article...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Article with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIArticleGenerator;
