
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Eye, EyeOff } from 'lucide-react';
import { AIConfig } from './types';

interface ConfigFieldProps {
  config: AIConfig;
  value: any;
  showSensitive: boolean;
  hasChanges: boolean;
  placeholder?: string;
  onValueChange: (value: any) => void;
  onSave: () => void;
  onToggleVisibility: () => void;
}

const ConfigField = ({
  config,
  value,
  showSensitive,
  hasChanges,
  placeholder,
  onValueChange,
  onSave,
  onToggleVisibility
}: ConfigFieldProps) => {
  const renderInput = () => {
    if (config.key === 'system_prompt') {
      return (
        <Textarea
          id={config.id}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          rows={4}
          className="flex-1"
        />
      );
    }
    
    if (config.key === 'default_provider') {
      return (
        <Select
          value={value}
          onValueChange={onValueChange}
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
      );
    }
    
    return (
      <Input
        id={config.id}
        type={config.is_sensitive && !showSensitive ? 'password' : config.key === 'temperature' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onValueChange(
          config.key === 'temperature' ? parseFloat(e.target.value) : e.target.value
        )}
        className="flex-1"
        placeholder={placeholder}
        step={config.key === 'temperature' ? '0.1' : undefined}
        min={config.key === 'temperature' ? '0' : undefined}
        max={config.key === 'temperature' ? '1' : undefined}
      />
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={config.id}>
        {config.key.replace(/_/g, ' ').toUpperCase()}
      </Label>
      <div className="flex gap-2">
        {renderInput()}
        
        {config.is_sensitive && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleVisibility}
          >
            {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        )}
        
        <Button
          onClick={onSave}
          disabled={!hasChanges}
          variant={hasChanges ? "default" : "outline"}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default ConfigField;
