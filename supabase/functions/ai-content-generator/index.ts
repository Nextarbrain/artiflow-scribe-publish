
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  type?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function getAIConfig() {
  console.log('Fetching AI configuration...');
  const { data, error } = await supabase
    .from('system_configurations')
    .select('*')
    .eq('category', 'ai');

  if (error) {
    console.error('Error fetching AI config:', error);
    return {};
  }

  const config: Record<string, any> = {};
  data?.forEach(item => {
    try {
      // Handle JSONB values
      if (typeof item.value === 'string') {
        try {
          config[item.key] = JSON.parse(item.value);
        } catch {
          config[item.key] = item.value;
        }
      } else {
        config[item.key] = item.value;
      }
    } catch (e) {
      console.error(`Error parsing config for key ${item.key}:`, e);
      config[item.key] = item.value;
    }
  });

  console.log('AI Config loaded:', Object.keys(config));
  console.log('AI enabled:', config.ai_enabled);
  console.log('Default provider:', config.default_provider);
  
  return config;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function calculateCost(provider: string, promptTokens: number, completionTokens: number): number {
  const costs = {
    openai: { input: 0.0015, output: 0.002 },
    gemini: { input: 0.00015, output: 0.0006 },
    deepseek: { input: 0.00014, output: 0.00028 }
  };

  const providerCosts = costs[provider as keyof typeof costs] || costs.openai;
  return ((promptTokens / 1000) * providerCosts.input) + ((completionTokens / 1000) * providerCosts.output);
}

async function generateWithOpenAI(request: AIRequest, config: any) {
  // Try multiple sources for API key
  const apiKey = Deno.env.get('OPENAI_API_KEY') || config.openai_api_key;
  
  console.log('Checking OpenAI API key...', !!apiKey);
  console.log('Environment API key exists:', !!Deno.env.get('OPENAI_API_KEY'));
  console.log('Config API key exists:', !!config.openai_api_key);
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to Supabase Edge Function secrets or configure it in the admin panel.');
  }

  const model = request.model || config.openai_model || 'gpt-4o-mini';
  const systemPrompt = request.systemPrompt || config.system_prompt || 'You are a helpful AI assistant that creates high-quality content.';
  
  console.log('Using OpenAI model:', model);
  
  const promptText = `${systemPrompt}\n\n${request.prompt}`;
  const promptTokens = estimateTokens(promptText);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: request.maxTokens || config.max_tokens || 2000,
      temperature: request.temperature || config.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const completionTokens = estimateTokens(content);
  const totalTokens = promptTokens + completionTokens;
  const cost = calculateCost('openai', promptTokens, completionTokens);

  return {
    content,
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens
    },
    model,
    cost
  };
}

async function generateWithGemini(request: AIRequest, config: any) {
  const apiKey = Deno.env.get('GEMINI_API_KEY') || config.gemini_api_key;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const model = request.model || config.gemini_model || 'gemini-1.5-flash';
  const systemPrompt = request.systemPrompt || config.system_prompt || 'You are a helpful AI assistant that creates high-quality content.';
  const promptText = `${systemPrompt}\n\n${request.prompt}`;
  const promptTokens = estimateTokens(promptText);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: promptText
        }]
      }],
      generationConfig: {
        temperature: request.temperature || config.temperature || 0.7,
        maxOutputTokens: request.maxTokens || config.max_tokens || 2000,
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  const completionTokens = estimateTokens(content);
  const totalTokens = promptTokens + completionTokens;
  const cost = calculateCost('gemini', promptTokens, completionTokens);

  return {
    content,
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens
    },
    model,
    cost
  };
}

async function generateWithDeepSeek(request: AIRequest, config: any) {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY') || config.deepseek_api_key;
  if (!apiKey) throw new Error('DeepSeek API key not configured');

  const model = request.model || config.deepseek_model || 'deepseek-chat';
  const systemPrompt = request.systemPrompt || config.system_prompt || 'You are a helpful AI assistant that creates high-quality content.';
  const promptText = `${systemPrompt}\n\n${request.prompt}`;
  const promptTokens = estimateTokens(promptText);

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: request.maxTokens || config.max_tokens || 2000,
      temperature: request.temperature || config.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const completionTokens = estimateTokens(content);
  const totalTokens = promptTokens + completionTokens;
  const cost = calculateCost('deepseek', promptTokens, completionTokens);

  return {
    content,
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens
    },
    model,
    cost
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI content generator called');
    const request: AIRequest = await req.json();
    console.log('Request received:', { ...request, prompt: request.prompt?.substring(0, 100) + '...' });
    
    const config = await getAIConfig();
    
    // Check if AI is enabled
    if (config.ai_enabled === false) {
      throw new Error('AI content generation is disabled in system settings');
    }
    
    // Default to OpenAI if no provider specified in config
    const provider = config.default_provider || 'openai';
    console.log('Using AI provider:', provider);
    
    let result: any;
    
    switch (provider) {
      case 'openai':
        result = await generateWithOpenAI(request, config);
        break;
      case 'gemini':
        result = await generateWithGemini(request, config);
        break;
      case 'deepseek':
        result = await generateWithDeepSeek(request, config);
        break;
      default:
        console.log('Unknown provider, defaulting to OpenAI');
        result = await generateWithOpenAI(request, config);
    }

    console.log('Generation successful, content length:', result.content?.length);

    return new Response(JSON.stringify({ 
      content: result.content,
      provider: provider,
      usage: result.usage,
      model: result.model,
      cost: result.cost,
      generatedText: result.content // For backward compatibility
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI content generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
