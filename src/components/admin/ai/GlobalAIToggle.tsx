
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { Power } from 'lucide-react';

const GlobalAIToggle = () => {
  const { configurations, updateConfiguration } = useSystemConfig();
  
  const aiEnabledConfig = configurations.find(config => 
    config.category === 'ai' && config.key === 'ai_enabled'
  );
  
  const isAIEnabled = aiEnabledConfig ? 
    (typeof aiEnabledConfig.value === 'string' ? 
      JSON.parse(aiEnabledConfig.value) : 
      aiEnabledConfig.value) : false;

  const handleToggle = async (enabled: boolean) => {
    if (aiEnabledConfig) {
      await updateConfiguration(aiEnabledConfig.id, enabled);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="w-5 h-5" />
          Global AI Control
        </CardTitle>
        <CardDescription>
          Enable or disable AI functionality across the entire application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">AI Functionality</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              When disabled, all AI features will be unavailable to users
            </p>
          </div>
          <Switch
            checked={isAIEnabled}
            onCheckedChange={handleToggle}
          />
        </div>
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Status: <span className={`font-medium ${isAIEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {isAIEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalAIToggle;
