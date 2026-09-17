import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  adaptRecipe,
  GroqLLMProvider,
  GeminiLLMProvider,
  FallbackLLMProvider,
  LLMProvider,
} from '@/lib/adaptRecipe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { recipeId, ingredients, servings, timeConstraint } = body

    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 })
    }

    const groqKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    if (!groqKey && !geminiKey) {
      return NextResponse.json(
        { error: 'Neither GROQ_API_KEY / LLM_API_KEY nor GEMINI_API_KEY configured' },
        { status: 500 }
      )
    }

    let llm: LLMProvider
    if (groqKey && geminiKey) {
      llm = new FallbackLLMProvider(
        new GroqLLMProvider(groqKey),
        new GeminiLLMProvider(geminiKey)
      )
    } else if (geminiKey) {
      llm = new GeminiLLMProvider(geminiKey)
    } else {
      llm = new GroqLLMProvider(groqKey!)
    }


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
