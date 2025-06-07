
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConfigField from './ConfigField';
import { AIProvider, AIConfig } from './types';
import { PLACEHOLDERS } from './constants';

interface ProviderCardProps {
  provider: AIProvider;
  configs: AIConfig[];
  editValues: Record<string, any>;
  showSensitive: Record<string, boolean>;
  onValueChange: (configId: string, value: any) => void;
  onSave: (configId: string) => void;
  onToggleVisibility: (configId: string) => void;
  getCurrentValue: (config: AIConfig) => any;
  hasChanges: (configId: string) => boolean;
}

const ProviderCard = ({
  provider,
  configs,
  editValues,
  showSensitive,
  onValueChange,
  onSave,
  onToggleVisibility,
  getCurrentValue,
  hasChanges
}: ProviderCardProps) => {
  const IconComponent = provider.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="w-5 h-5" />
          {provider.name} Configuration
        </CardTitle>
        <CardDescription>{provider.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {provider.configs.map((configKey) => {
          const config = configs.find(c => c.key === configKey);
          if (!config) return null;
          
          return (
            <ConfigField
              key={config.id}
              config={config}
              value={getCurrentValue(config)}
              showSensitive={showSensitive[config.id] || false}
              hasChanges={hasChanges(config.id)}
              placeholder={PLACEHOLDERS[configKey as keyof typeof PLACEHOLDERS]}
              onValueChange={(value) => onValueChange(config.id, value)}
              onSave={() => onSave(config.id)}
              onToggleVisibility={() => onToggleVisibility(config.id)}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
