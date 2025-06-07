
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  provider: 'openai' | 'gemini' | 'deepseek';
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function getAIConfig() {
  const { data, error } = await supabase
    .from('system_configurations')
    .select('*')
    .eq('category', 'ai');

  if (error) throw error;

  const config: Record<string, any> = {};
  data.forEach(item => {
    try {
      config[item.key] = JSON.parse(item.value);
    } catch {
      config[item.key] = item.value;
    }
  });

  return config;
}

async function generateWithOpenAI(request: AIRequest, config: any) {
  const apiKey = config.openai_api_key;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || config.openai_model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: request.systemPrompt || config.system_prompt },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: request.maxTokens || config.max_tokens || 2000,
      temperature: request.temperature || config.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithGemini(request: AIRequest, config: any) {
  const apiKey = config.gemini_api_key;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const model = request.model || config.gemini_model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${request.systemPrompt || config.system_prompt}\n\n${request.prompt}`
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
  return data.candidates[0].content.parts[0].text;
}

async function generateWithDeepSeek(request: AIRequest, config: any) {
  const apiKey = config.deepseek_api_key;
  if (!apiKey) throw new Error('DeepSeek API key not configured');

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || config.deepseek_model || 'deepseek-chat',
      messages: [
        { role: 'system', content: request.systemPrompt || config.system_prompt },
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
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: AIRequest = await req.json();
    const config = await getAIConfig();
    
    const provider = request.provider || config.default_provider || 'openai';
    
    let generatedContent: string;
    
    switch (provider) {
      case 'openai':
        generatedContent = await generateWithOpenAI(request, config);
        break;
      case 'gemini':
        generatedContent = await generateWithGemini(request, config);
        break;
      case 'deepseek':
        generatedContent = await generateWithDeepSeek(request, config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    return new Response(JSON.stringify({ 
      content: generatedContent,
      provider: provider 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI content generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
