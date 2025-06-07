
export interface AIProvider {
  key: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  configs: string[];
}

export interface AIConfig {
  id: string;
  key: string;
  value: any;
  is_sensitive: boolean;
  description?: string;
}
