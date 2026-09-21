import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  adaptRecipe,
  GroqLLMProvider,
  OpenRouterLLMProvider,
  GeminiLLMProvider,
  NvidiaLLMProvider,
  FallbackLLMProvider,
  LLMProvider,
} from '@/lib/adaptRecipe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { recipeId, ingredients, servings, timeConstraint } = body

    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 })
    }

    // Public links use the stable migration slug; adaptation reads the UUID key.
    // UUID links continue to work without an extra lookup.
    if (typeof recipeId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(recipeId)) {
      const { data: bySlug } = await supabaseAdmin
        .from('recipes')
        .select('id')
        .eq('slug', recipeId)
        .maybeSingle()
      if (bySlug?.id) recipeId = bySlug.id
    }

    const groqKey = process.env.LLM_API_KEY || process.env.GROQ_API_KEY
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    const nvidiaKey = process.env.NVIDIA_API_KEY

    const providers: LLMProvider[] = []

    // 1. Primary: Groq (ultra-fast 1.3s response time)
    if (groqKey) {
      providers.push(new GroqLLMProvider(groqKey, 'openai/gpt-oss-20b'))
    }

    // 2. High capacity: OpenRouter (flexible multi-model auto router)
    if (openrouterKey) {
      providers.push(new OpenRouterLLMProvider(openrouterKey, 'openrouter/auto'))
    }

    // 3. Gemini fallback
    if (geminiKey) {
      providers.push(new GeminiLLMProvider(geminiKey, 'gemini-2.0-flash'))
    }

    // 4. NVIDIA NIM
    if (nvidiaKey) {
      providers.push(new NvidiaLLMProvider(nvidiaKey))
    }

    if (providers.length === 0) {
      return NextResponse.json(
        { error: 'No LLM providers configured' },
        { status: 500 }
      )
    }

    // Multi-tier rollover: if current LLM fails, seamlessly fail over to next
    const llm = new FallbackLLMProvider(providers[0], ...providers.slice(1))

    const result = await adaptRecipe(
      {
        recipeId,
        ingredients: ingredients ?? [],
        servings: servings ?? 2,
        timeConstraint: timeConstraint ?? null,
      },
      supabaseAdmin,
      llm
    )

    return NextResponse.json(result)
  } catch (err) {
    console.error('[POST /api/adapt-recipe]', err)
    return NextResponse.json(
      { error: 'Failed to adapt recipe', details: String(err) },
      { status: 500 }
    )
  }
}
