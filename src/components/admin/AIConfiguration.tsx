
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { Brain } from 'lucide-react';
import ProviderCard from './ai/ProviderCard';
import SettingsCard from './ai/SettingsCard';
import TestingTab from './ai/TestingTab';
import { AI_PROVIDERS } from './ai/constants';

const AIConfiguration = () => {
  const { configurations, loading, updateConfiguration } = useSystemConfig();
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, any>>({});

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
          {AI_PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider.key}
              provider={provider}
              configs={aiConfigs}
              editValues={editValues}
              showSensitive={showSensitive}
              onValueChange={handleValueChange}
              onSave={handleSave}
              onToggleVisibility={toggleSensitiveVisibility}
              getCurrentValue={getCurrentValue}
              hasChanges={hasChanges}
            />
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {['default_provider', 'system_prompt', 'max_tokens', 'temperature'].map((key) => {
            const config = getConfigByKey(key);
            if (!config) return null;
            
            return (
              <SettingsCard
                key={config.id}
                config={config}
                editValues={editValues}
                showSensitive={showSensitive}
                onValueChange={handleValueChange}
                onSave={handleSave}
                onToggleVisibility={toggleSensitiveVisibility}
                getCurrentValue={getCurrentValue}
                hasChanges={hasChanges}
              />
            );
          })}
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <TestingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIConfiguration;
