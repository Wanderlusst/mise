import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { matchRecipes, MatchInput, EmbeddingProvider } from '@/lib/matchEngine'
import OpenAI from 'openai'

// OpenAI is used ONLY for embeddings (text-embedding-ada-002)
// The service role key and API key never reach the client bundle.
function getEmbedder(): EmbeddingProvider {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) throw new Error('Missing env: LLM_API_KEY (needed for OpenAI embeddings)')
  const client = new OpenAI({ apiKey })
  return {
    async embedText(text: string): Promise<number[]> {
      const response = await client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      })
      return response.data[0].embedding
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const input: MatchInput = {
      time: body.time ?? null,
      category: body.category ?? null,
      ingredients: body.ingredients ?? null,
      diet: body.diet ?? null,
      servings: body.servings ?? 2,
      allergies: body.allergies ?? null,
      region: body.region ?? null,
      pantryStaples: body.pantryStaples ?? null,
    }

    const hasIngredients = input.ingredients && input.ingredients.length > 0
    const embedder = hasIngredients ? getEmbedder() : undefined

    const results = await matchRecipes(input, supabaseAdmin, embedder)

    return NextResponse.json({ recipes: results })
  } catch (err) {
    console.error('[POST /api/match-recipes]', err)
    return NextResponse.json(
      { error: 'Failed to match recipes', details: String(err) },
      { status: 500 }
    )
  }
}
