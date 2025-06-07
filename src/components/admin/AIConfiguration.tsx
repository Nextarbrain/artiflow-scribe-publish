
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { Brain, Sparkles, Zap, Save, Eye, EyeOff, TestTube } from 'lucide-react';
import { useAIGeneration } from '@/hooks/useAIGeneration';

const AIConfiguration = () => {
  const { configurations, loading, updateConfiguration, getConfigValue } = useSystemConfig();
  const { generateContent, isGenerating } = useAIGeneration();
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [testPrompt, setTestPrompt] = useState('Write a short paragraph about the benefits of renewable energy.');
  const [testResult, setTestResult] = useState('');

  const aiConfigs = configurations.filter(config => config.category === 'ai');

  const handleValueChange = (configId: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [configId]: value
    }));
  };

  const handleSave = async (configId: string) => {
    const value = editValues[configId];
    if (value !== undefined) {
      await updateConfiguration(configId, value);
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[configId];
        return newValues;
      });
    }
  };

  const toggleSensitiveVisibility = (configId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const getDisplayValue = (config: any) => {
    if (config.is_sensitive && !showSensitive[config.id]) {
      return '••••••••';
    }
    
    if (typeof config.value === 'string') {
      try {
        return JSON.parse(config.value);
      } catch {
        return config.value;
      }
    }
    return config.value;
  };

  const getCurrentValue = (config: any) => {
    if (editValues[config.id] !== undefined) {
      return editValues[config.id];
    }
    return getDisplayValue(config);
  };

  const hasChanges = (configId: string) => {
    return editValues[configId] !== undefined;
  };

  const testAIProvider = async (provider: 'openai' | 'gemini' | 'deepseek') => {
    const result = await generateContent({
      prompt: testPrompt,
      provider: provider,
    });
    
    if (result) {
      setTestResult(`✅ ${provider.toUpperCase()} Test Successful:\n\n${result.content}`);
    }
  };

  const providerIcons = {
    'openai': <Brain className="w-4 h-4" />,
    'gemini': <Sparkles className="w-4 h-4" />,
    'deepseek': <Zap className="w-4 h-4" />,
  };

  const getConfigByKey = (key: string) => {
    return aiConfigs.find(config => config.key === key);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Configuration</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure AI providers and content generation settings</p>
        </div>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* OpenAI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {providerIcons.openai}
                OpenAI Configuration
              </CardTitle>
              <CardDescription>Configure OpenAI GPT models for content generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['openai_api_key', 'openai_model'].map((key) => {
                const config = getConfigByKey(key);
                if (!config) return null;
                
                return (
                  <div key={config.id} className="space-y-2">
                    <Label htmlFor={config.id}>{config.key.replace(/_/g, ' ').toUpperCase()}</Label>
                    <div className="flex gap-2">
                      <Input
                        id={config.id}
                        type={config.is_sensitive && !showSensitive[config.id] ? 'password' : 'text'}
                        value={getCurrentValue(config)}
                        onChange={(e) => handleValueChange(config.id, e.target.value)}
                        className="flex-1"
                        placeholder={key === 'openai_model' ? 'gpt-4o-mini' : 'sk-...'}
                      />
                      
                      {config.is_sensitive && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleSensitiveVisibility(config.id)}
                        >
                          {showSensitive[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleSave(config.id)}
                        disabled={!hasChanges(config.id)}
                        variant={hasChanges(config.id) ? "default" : "outline"}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Gemini Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {providerIcons.gemini}
                Google Gemini Configuration
              </CardTitle>
              <CardDescription>Configure Google Gemini models for content generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['gemini_api_key', 'gemini_model'].map((key) => {
                const config = getConfigByKey(key);
                if (!config) return null;
                
                return (
                  <div key={config.id} className="space-y-2">
                    <Label htmlFor={config.id}>{config.key.replace(/_/g, ' ').toUpperCase()}</Label>
                    <div className="flex gap-2">
                      <Input
                        id={config.id}
                        type={config.is_sensitive && !showSensitive[config.id] ? 'password' : 'text'}
                        value={getCurrentValue(config)}
                        onChange={(e) => handleValueChange(config.id, e.target.value)}
                        className="flex-1"
                        placeholder={key === 'gemini_model' ? 'gemini-1.5-flash' : 'AIza...'}
                      />
                      
                      {config.is_sensitive && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleSensitiveVisibility(config.id)}
                        >
                          {showSensitive[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleSave(config.id)}
                        disabled={!hasChanges(config.id)}
                        variant={hasChanges(config.id) ? "default" : "outline"}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* DeepSeek Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {providerIcons.deepseek}
                DeepSeek Configuration
              </CardTitle>
              <CardDescription>Configure DeepSeek models for content generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['deepseek_api_key', 'deepseek_model'].map((key) => {
                const config = getConfigByKey(key);
                if (!config) return null;
                
                return (
                  <div key={config.id} className="space-y-2">
                    <Label htmlFor={config.id}>{config.key.replace(/_/g, ' ').toUpperCase()}</Label>
                    <div className="flex gap-2">
                      <Input
                        id={config.id}
                        type={config.is_sensitive && !showSensitive[config.id] ? 'password' : 'text'}
                        value={getCurrentValue(config)}
                        onChange={(e) => handleValueChange(config.id, e.target.value)}
                        className="flex-1"
                        placeholder={key === 'deepseek_model' ? 'deepseek-chat' : 'sk-...'}
                      />
                      
                      {config.is_sensitive && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleSensitiveVisibility(config.id)}
                        >
                          {showSensitive[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleSave(config.id)}
                        disabled={!hasChanges(config.id)}
                        variant={hasChanges(config.id) ? "default" : "outline"}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {['default_provider', 'system_prompt', 'max_tokens', 'temperature'].map((key) => {
            const config = getConfigByKey(key);
            if (!config) return null;
            
            return (
              <Card key={config.id}>
                <CardHeader>
                  <CardTitle>{config.key.replace(/_/g, ' ').toUpperCase()}</CardTitle>
                  {config.description && (
                    <CardDescription>{config.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={config.id}>Value</Label>
                    <div className="flex gap-2">
                      {config.key === 'system_prompt' ? (
                        <Textarea
                          id={config.id}
                          value={getCurrentValue(config)}
                          onChange={(e) => handleValueChange(config.id, e.target.value)}
                          rows={4}
                          className="flex-1"
                        />
                      ) : config.key === 'default_provider' ? (
                        <Select
                          value={getCurrentValue(config)}
                          onValueChange={(value) => handleValueChange(config.id, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="gemini">Google Gemini</SelectItem>
                            <SelectItem value="deepseek">DeepSeek</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={config.id}
                          type={config.key === 'temperature' ? 'number' : 'text'}
                          value={getCurrentValue(config)}
                          onChange={(e) => handleValueChange(config.id, config.key === 'temperature' ? parseFloat(e.target.value) : e.target.value)}
                          className="flex-1"
                          step={config.key === 'temperature' ? '0.1' : undefined}
                          min={config.key === 'temperature' ? '0' : undefined}
                          max={config.key === 'temperature' ? '1' : undefined}
                        />
                      )}
                      
                      <Button
                        onClick={() => handleSave(config.id)}
                        disabled={!hasChanges(config.id)}
                        variant={hasChanges(config.id) ? "default" : "outline"}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
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
                  {providerIcons.openai}
                  Test OpenAI
                </Button>
                <Button 
                  onClick={() => testAIProvider('gemini')}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {providerIcons.gemini}
                  Test Gemini
                </Button>
                <Button 
                  onClick={() => testAIProvider('deepseek')}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {providerIcons.deepseek}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIConfiguration;
