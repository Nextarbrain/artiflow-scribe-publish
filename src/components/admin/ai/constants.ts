
import { Brain, Sparkles, Zap } from 'lucide-react';

export const PROVIDER_ICONS = {
  'openai': Brain,
  'gemini': Sparkles,
  'deepseek': Zap,
};

export const AI_PROVIDERS = [
  {
    key: 'openai',
    name: 'OpenAI',
    icon: Brain,
    description: 'Configure OpenAI GPT models for content generation',
    configs: ['openai_api_key', 'openai_model']
  },
  {
    key: 'gemini',
    name: 'Google Gemini',
    icon: Sparkles,
    description: 'Configure Google Gemini models for content generation',
    configs: ['gemini_api_key', 'gemini_model']
  },
  {
    key: 'deepseek',
    name: 'DeepSeek',
    icon: Zap,
    description: 'Configure DeepSeek models for content generation',
    configs: ['deepseek_api_key', 'deepseek_model']
  }
];

export const PLACEHOLDERS = {
  'openai_model': 'gpt-4o-mini',
  'openai_api_key': 'sk-...',
  'gemini_model': 'gemini-1.5-flash',
  'gemini_api_key': 'AIza...',
  'deepseek_model': 'deepseek-chat',
  'deepseek_api_key': 'sk-...',
};
