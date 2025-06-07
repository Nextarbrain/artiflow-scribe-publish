
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConfigField from './ConfigField';
import { AIConfig } from './types';

interface SettingsCardProps {
  config: AIConfig;
  editValues: Record<string, any>;
  showSensitive: Record<string, boolean>;
  onValueChange: (configId: string, value: any) => void;
  onSave: (configId: string) => void;
  onToggleVisibility: (configId: string) => void;
  getCurrentValue: (config: AIConfig) => any;
  hasChanges: (configId: string) => boolean;
}

const SettingsCard = ({
  config,
  editValues,
  showSensitive,
  onValueChange,
  onSave,
  onToggleVisibility,
  getCurrentValue,
  hasChanges
}: SettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.key.replace(/_/g, ' ').toUpperCase()}</CardTitle>
        {config.description && (
          <CardDescription>{config.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ConfigField
          config={config}
          value={getCurrentValue(config)}
          showSensitive={showSensitive[config.id] || false}
          hasChanges={hasChanges(config.id)}
          onValueChange={(value) => onValueChange(config.id, value)}
          onSave={() => onSave(config.id)}
          onToggleVisibility={() => onToggleVisibility(config.id)}
        />
      </CardContent>
    </Card>
  );
};

export default SettingsCard;
