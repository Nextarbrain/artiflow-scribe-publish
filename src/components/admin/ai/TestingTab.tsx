
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TestTube } from 'lucide-react';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { PROVIDER_ICONS } from './constants';

const TestingTab = () => {
  const { generateContent, isGenerating } = useAIGeneration();
  const [testPrompt, setTestPrompt] = useState('Write a short paragraph about the benefits of renewable energy.');
  const [testResult, setTestResult] = useState('');

  const testAIProvider = async (provider: 'openai' | 'gemini' | 'deepseek') => {
    const result = await generateContent({
      prompt: testPrompt,
      provider: provider,
    });
    
    if (result) {
      setTestResult(`✅ ${provider.toUpperCase()} Test Successful:\n\n${result.content}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Test AI Providers
        </CardTitle>
        <CardDescription>Test your AI provider configurations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testPrompt">Test Prompt</Label>
          <Textarea
            id="testPrompt"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter a test prompt..."
            rows={3}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => testAIProvider('openai')}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PROVIDER_ICONS.openai className="w-4 h-4" />
            Test OpenAI
          </Button>
          <Button 
            onClick={() => testAIProvider('gemini')}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PROVIDER_ICONS.gemini className="w-4 h-4" />
            Test Gemini
          </Button>
          <Button 
            onClick={() => testAIProvider('deepseek')}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PROVIDER_ICONS.deepseek className="w-4 h-4" />
            Test DeepSeek
          </Button>
        </div>
        
        {testResult && (
          <div className="mt-4">
            <Label>Test Result</Label>
            <Textarea
              value={testResult}
              readOnly
              rows={6}
              className="mt-2 bg-gray-50 dark:bg-gray-900"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestingTab;
