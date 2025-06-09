
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeOff, Save, CheckCircle, XCircle } from 'lucide-react';
import { AI_PROVIDERS } from './constants';
import { AIConfig } from './types';

interface APIKeysCardProps {
  configs: AIConfig[];
  editValues: Record<string, any>;
  showSensitive: Record<string, boolean>;
  onValueChange: (configId: string, value: any) => void;
  onSave: (configId: string) => void;
  onToggleVisibility: (configId: string) => void;
  getCurrentValue: (config: AIConfig) => any;
  hasChanges: (configId: string) => boolean;
}

const APIKeysCard = ({
  configs,
  editValues,
  showSensitive,
  onValueChange,
  onSave,
  onToggleVisibility,
  getCurrentValue,
  hasChanges
}: APIKeysCardProps) => {
  const getAPIKeyConfig = (provider: string) => {
    return configs.find(config => config.key === `${provider}_api_key`);
  };

  const isAPIKeyConfigured = (provider: string) => {
    const config = getAPIKeyConfig(provider);
    if (!config) return false;
    const value = getCurrentValue(config);
    return value && value.trim() && value !== '••••••••';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          AI API Keys Management
        </CardTitle>
        <CardDescription>
          Add or update your AI provider API keys. These keys are stored securely and are required for AI content generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {AI_PROVIDERS.map((provider) => {
          const apiKeyConfig = getAPIKeyConfig(provider.key);
          if (!apiKeyConfig) return null;

          const IconComponent = provider.icon;
          const configured = isAPIKeyConfigured(provider.key);
          const currentValue = getCurrentValue(apiKeyConfig);
          const hasUnsavedChanges = hasChanges(apiKeyConfig.id);

          return (
            <div key={provider.key} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                <Badge variant={configured ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {configured ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Configured
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Not Set
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${provider.key}-api-key`}>
                  API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`${provider.key}-api-key`}
                    type={showSensitive[apiKeyConfig.id] ? 'text' : 'password'}
                    value={currentValue || ''}
                    onChange={(e) => onValueChange(apiKeyConfig.id, e.target.value)}
                    placeholder={`Enter your ${provider.name} API key...`}
                    className="flex-1"
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onToggleVisibility(apiKeyConfig.id)}
                  >
                    {showSensitive[apiKeyConfig.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => onSave(apiKeyConfig.id)}
                    disabled={!hasUnsavedChanges}
                    variant={hasUnsavedChanges ? "default" : "outline"}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {!configured && (
                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  ⚠️ This provider won't work until you add a valid API key
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Getting API Keys</h4>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• <strong>OpenAI:</strong> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></p>
            <p>• <strong>Google Gemini:</strong> Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></p>
            <p>• <strong>DeepSeek:</strong> Get your API key from <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="underline">platform.deepseek.com/api_keys</a></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeysCard;
