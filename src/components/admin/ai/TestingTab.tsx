
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { Wand2, Loader2 } from 'lucide-react';

const TestingTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState('');
  const [result, setResult] = useState<string>('');
  const { generateContent, isGenerating, lastGeneration } = useAIGeneration();

  const handleTest = async () => {
    if (!prompt.trim()) return;

    const response = await generateContent({
      prompt,
      systemPrompt: systemPrompt || undefined,
      maxTokens,
      temperature,
      model: model || undefined,
    });

    if (response) {
      setResult(response.content);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test AI Generation</CardTitle>
          <CardDescription>
            Test your AI configuration with custom prompts and parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your test prompt..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="system-prompt">System Prompt (Optional)</Label>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system prompt..."
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="model">Model (Optional)</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., gpt-4o-mini"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleTest}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Test AI Generation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {lastGeneration && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">
                Provider: {lastGeneration.provider}
              </Badge>
              {lastGeneration.model && (
                <Badge variant="outline">
                  Model: {lastGeneration.model}
                </Badge>
              )}
              {lastGeneration.usage && (
                <>
                  <Badge variant="outline">
                    Tokens: {lastGeneration.usage.total_tokens}
                  </Badge>
                  {lastGeneration.cost && (
                    <Badge variant="outline">
                      Cost: ${lastGeneration.cost.toFixed(4)}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestingTab;
