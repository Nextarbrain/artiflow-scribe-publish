
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  prompt: string;
  provider?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { prompt, provider, model, maxTokens, temperature, userId }: AIRequest = await req.json()

    if (!prompt || !userId) {
      return new Response(
        JSON.stringify({ error: 'Prompt and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get AI configurations from database
    const { data: configs, error: configError } = await supabaseClient
      .from('system_configurations')
      .select('key, value')
      .eq('category', 'ai')

    if (configError) {
      throw new Error(`Failed to fetch AI configurations: ${configError.message}`)
    }

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = typeof config.value === 'string' ? JSON.parse(config.value) : config.value
      return acc
    }, {} as Record<string, any>)

    // Check if AI is enabled
    if (!configMap.ai_enabled) {
      return new Response(
        JSON.stringify({ error: 'AI functionality is currently disabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use provided values or fall back to database defaults
    const selectedProvider = provider || configMap.default_provider || 'openai'
    const selectedModel = model || configMap[`${selectedProvider}_model`] || 'gpt-4o-mini'
    const selectedMaxTokens = maxTokens || configMap.max_tokens || 2000
    const selectedTemperature = temperature || configMap.temperature || 0.7
    const systemPrompt = configMap.system_prompt || 'You are a helpful AI assistant.'

    // Get API key for the selected provider
    const apiKey = configMap[`${selectedProvider}_api_key`]
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key not configured for provider: ${selectedProvider}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startTime = Date.now()
    let response, content, usage

    try {
      if (selectedProvider === 'openai') {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            max_tokens: selectedMaxTokens,
            temperature: selectedTemperature,
          }),
        })

        if (!openaiResponse.ok) {
          const error = await openaiResponse.json()
          throw new Error(error.error?.message || 'OpenAI API error')
        }

        const data = await openaiResponse.json()
        content = data.choices[0]?.message?.content
        usage = data.usage

      } else if (selectedProvider === 'gemini') {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
            }],
            generationConfig: {
              maxOutputTokens: selectedMaxTokens,
              temperature: selectedTemperature,
            }
          }),
        })

        if (!geminiResponse.ok) {
          const error = await geminiResponse.json()
          throw new Error(error.error?.message || 'Gemini API error')
        }

        const data = await geminiResponse.json()
        content = data.candidates[0]?.content?.parts[0]?.text
        usage = { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 } // Gemini doesn't provide detailed usage

      } else if (selectedProvider === 'deepseek') {
        const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            max_tokens: selectedMaxTokens,
            temperature: selectedTemperature,
          }),
        })

        if (!deepseekResponse.ok) {
          const error = await deepseekResponse.json()
          throw new Error(error.error?.message || 'DeepSeek API error')
        }

        const data = await deepseekResponse.json()
        content = data.choices[0]?.message?.content
        usage = data.usage

      } else {
        throw new Error(`Unsupported provider: ${selectedProvider}`)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Log the AI usage
      await supabaseClient
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          provider: selectedProvider,
          model: selectedModel,
          prompt_tokens: usage?.prompt_tokens || 0,
          completion_tokens: usage?.completion_tokens || 0,
          total_tokens: usage?.total_tokens || 0,
          request_duration_ms: duration,
          success: true,
          estimated_cost: calculateCost(selectedProvider, selectedModel, usage),
        })

      return new Response(
        JSON.stringify({ 
          content,
          provider: selectedProvider,
          model: selectedModel,
          usage,
          duration
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      // Log the failed attempt
      await supabaseClient
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          provider: selectedProvider,
          model: selectedModel,
          request_duration_ms: duration,
          success: false,
          error_message: error.message,
        })

      throw error
    }

  } catch (error) {
    console.error('AI generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateCost(provider: string, model: string, usage: any): number {
  if (!usage?.total_tokens) return 0

  // Rough cost estimates (update with actual pricing)
  const costPer1KTokens = {
    'openai': {
      'gpt-4o-mini': 0.00015,
      'gpt-4o': 0.03,
      'gpt-3.5-turbo': 0.002,
    },
    'gemini': {
      'gemini-1.5-flash': 0.000075,
      'gemini-1.5-pro': 0.00125,
    },
    'deepseek': {
      'deepseek-chat': 0.00014,
      'deepseek-coder': 0.00014,
    }
  }

  const rate = costPer1KTokens[provider]?.[model] || 0
  return (usage.total_tokens / 1000) * rate
}
