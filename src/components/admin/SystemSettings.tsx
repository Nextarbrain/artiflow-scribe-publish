
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { Eye, EyeOff, Save, Settings } from 'lucide-react';

const SystemSettings = () => {
  const { configurations, loading, updateConfiguration } = useSystemConfig();
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, any>>({});

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
    
    // Handle JSONB values - extract the actual value
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

  const categorizedConfigs = configurations.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, typeof configurations>);

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
        <Settings className="w-6 h-6" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings and integrations</p>
        </div>
      </div>

      <Tabs defaultValue={Object.keys(categorizedConfigs)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(categorizedConfigs).map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categorizedConfigs).map(([category, configs]) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{config.key.replace(/_/g, ' ').toUpperCase()}</CardTitle>
                        {config.description && (
                          <CardDescription>{config.description}</CardDescription>
                        )}
                      </div>
                      {config.is_sensitive && (
                        <Badge variant="secondary">Sensitive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                          ) : (
                            <Input
                              id={config.id}
                              type={config.is_sensitive && !showSensitive[config.id] ? 'password' : 'text'}
                              value={getCurrentValue(config)}
                              onChange={(e) => handleValueChange(config.id, e.target.value)}
                              className="flex-1"
                            />
                          )}
                          
                          {config.is_sensitive && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleSensitiveVisibility(config.id)}
                            >
                              {showSensitive[config.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
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
                      
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(config.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SystemSettings;
