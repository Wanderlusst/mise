import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { matchRecipes, MatchInput, EmbeddingProvider } from '@/lib/matchEngine'
import { generateRecipesWithAI } from '@/lib/generateRecipes'
import OpenAI from 'openai'

function getEmbedder(): EmbeddingProvider | undefined {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) return undefined

  try {
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
  } catch {
    return undefined
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

    // Optional: array of recipe IDs to exclude (used by "Find another recipe")
    const exclude: string[] = Array.isArray(body.exclude) ? body.exclude : []

    const embedder = getEmbedder()
    let results = await matchRecipes(input, supabaseAdmin, embedder)

    // Filter out excluded IDs so "Find another recipe" never returns the same match
    if (exclude.length > 0) {
      results = results.filter((r) => !exclude.includes(r.id))
    }

    // If no matching candidates exist in DB or all candidates were excluded,
    // call the AI model to generate fresh, tailored recipes using user's ingredients/filters.
    if (results.length === 0) {
      console.log('[match-recipes] No DB candidates remaining, generating fresh recipes with AI...')
      try {
        const aiRecipes = await generateRecipesWithAI({
          ingredients: input.ingredients,
          category: input.category,
          diet: input.diet,
          time: input.time,
          servings: input.servings,
          region: input.region,
          allergies: input.allergies,
          exclude,
          count: 4,
        })
        if (aiRecipes.length > 0) {
          results = aiRecipes
        }
      } catch (aiErr) {
        console.warn('[match-recipes] AI generation rollover failed:', aiErr)
      }
    }

    return NextResponse.json({ recipes: results })
  } catch (err) {
    console.error('[POST /api/match-recipes]', err)
    return NextResponse.json(
      { error: 'Failed to match recipes', details: String(err) },
      { status: 500 }
    )
  }
}
