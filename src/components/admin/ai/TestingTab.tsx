
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAIConfig } from '@/hooks/useAIConfig';
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TestingTab = () => {
  const { config, generateContent } = useAIConfig();
  const { toast } = useToast();
  const [testPrompt, setTestPrompt] = useState('Write a short article about the benefits of renewable energy.');
  const [selectedProvider, setSelectedProvider] = useState('default');
  const [selectedModel, setSelectedModel] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const providers = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
    { value: 'gemini', label: 'Google Gemini', models: ['gemini-1.5-flash', 'gemini-1.5-pro'] },
    { value: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] }
  ];

  const currentProvider = providers.find(p => p.value === selectedProvider);

  const handleTest = async () => {
    if (!testPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test prompt",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setTestResult(null);

      const options: any = {};
      if (selectedProvider && selectedProvider !== 'default') options.provider = selectedProvider;
      if (selectedModel && selectedModel !== 'default') options.model = selectedModel;

      const result = await generateContent(testPrompt, options);
      setTestResult({ success: true, ...result });

      toast({
        title: "Test Successful",
        description: "AI content generation test completed successfully",
      });
    } catch (error: any) {
      setTestResult({ 
        success: false, 
        error: error.message || 'Test failed' 
      });
      
      toast({
        title: "Test Failed",
        description: error.message || "AI content generation test failed",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isAIEnabled = config.ai_enabled;
  const hasAPIKey = selectedProvider && selectedProvider !== 'default' ? config[`${selectedProvider}_api_key`] : true;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            AI Configuration Testing
          </CardTitle>
          <CardDescription>
            Test your AI configuration with different providers and models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAIEnabled && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                ⚠️ AI functionality is currently disabled. Enable it in the Settings tab to test.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider (Optional)</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Use default provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Use Default Provider</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Model (Optional)</label>
              <Select 
                value={selectedModel} 
                onValueChange={setSelectedModel}
                disabled={!selectedProvider || selectedProvider === 'default'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Use default model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Use Default Model</SelectItem>
                  {currentProvider?.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Prompt</label>
            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              rows={3}
              placeholder="Enter a prompt to test AI generation..."
            />
          </div>

          {selectedProvider && selectedProvider !== 'default' && !hasAPIKey && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                ⚠️ API key not configured for {selectedProvider}. Please set it up in the Providers tab.
              </p>
            </div>
          )}

          <Button 
            onClick={handleTest} 
            disabled={isGenerating || !isAIEnabled || (selectedProvider && selectedProvider !== 'default' && !hasAPIKey)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Test AI Generation
              </>
            )}
          </Button>

          {testResult && (
            <Card className={testResult.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  Test {testResult.success ? 'Successful' : 'Failed'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResult.success ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Provider:</span> {testResult.provider}
                      </div>
                      <div>
                        <span className="font-medium">Model:</span> {testResult.model}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {testResult.duration}ms
                      </div>
                      {testResult.usage && (
                        <div>
                          <span className="font-medium">Tokens:</span> {testResult.usage.total_tokens}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Generated Content:</span>
                      <div className="mt-2 p-3 bg-white dark:bg-gray-800 border rounded whitespace-pre-wrap text-sm">
                        {testResult.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400">
                    <span className="font-medium">Error:</span> {testResult.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingTab;
