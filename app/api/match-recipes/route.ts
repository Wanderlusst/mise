import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { matchRecipes, MatchInput, EmbeddingProvider } from '@/lib/matchEngine'
import { generateRecipesWithAI } from '@/lib/generateRecipes'
import { rateLimiter, getClientIp } from '@/lib/rateLimit'
import { recipeMatchCache, buildMatchCacheKey } from '@/lib/cache'
import OpenAI from 'openai'

// Module-scoped singleton instance for OpenAI embeddings
let cachedOpenAIClient: OpenAI | null = null
let cachedOpenAIApiKey: string | null = null

function getEmbedder(): EmbeddingProvider | undefined {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) return undefined

  try {
    if (!cachedOpenAIClient || cachedOpenAIApiKey !== apiKey) {
      cachedOpenAIClient = new OpenAI({ apiKey })
      cachedOpenAIApiKey = apiKey
    }
    const client = cachedOpenAIClient
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

const VALID_CATEGORIES = ['drink', 'salad', 'yogurt', 'snack', 'meal']
const VALID_DIETS = ['all', 'veg', 'non-veg', 'vegan', 'jain']

export async function POST(req: NextRequest) {
  // ── Rate Limiting (Protects database and costly LLM/embedding calls) ──
  const clientIp = getClientIp(req)
  const rateLimitResult = rateLimiter.check(clientIp, { limit: 40, windowMs: 60 * 1000 })
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.reset),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Malformed request: JSON body required' }, { status: 400 })
    }

    // ── Input Validation ──
    if (body.time !== undefined && body.time !== null) {
      if (typeof body.time !== 'number' || isNaN(body.time) || body.time < 0) {
        return NextResponse.json(
          { error: 'Invalid time: must be a non-negative number' },
          { status: 400 }
        )
      }
    }

    if (body.category !== undefined && body.category !== null) {
      if (typeof body.category !== 'string' || !VALID_CATEGORIES.includes(body.category.toLowerCase())) {
        return NextResponse.json(
          { error: `Invalid category: '${body.category}'. Allowed categories: ${VALID_CATEGORIES.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (body.diet !== undefined && body.diet !== null) {
      if (typeof body.diet !== 'string' || !VALID_DIETS.includes(body.diet.toLowerCase())) {
        return NextResponse.json(
          { error: `Invalid diet: '${body.diet}'. Allowed diets: ${VALID_DIETS.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (body.ingredients !== undefined && body.ingredients !== null) {
      if (!Array.isArray(body.ingredients)) {
        return NextResponse.json(
          { error: 'Invalid ingredients: must be an array of strings' },
          { status: 400 }
        )
      }
      if (body.ingredients.length === 0) {
        return NextResponse.json(
          { error: 'Empty ingredients array: provide ingredient names or omit field for time-only query' },
          { status: 400 }
        )
      }
    }

    const input: MatchInput = {
      time: body.time ?? null,
      category: body.category ? body.category.toLowerCase() : null,
      ingredients: body.ingredients ?? null,
      diet: body.diet ? body.diet.toLowerCase() : null,
      servings: typeof body.servings === 'number' && body.servings > 0 ? body.servings : 2,
      allergies: Array.isArray(body.allergies) ? body.allergies : null,
      region: body.region ?? null,
      pantryStaples: Array.isArray(body.pantryStaples) ? body.pantryStaples : null,
    }

    // Optional: array of recipe IDs to exclude (used by "Find another recipe")
    const exclude: string[] = Array.isArray(body.exclude) ? body.exclude : []

    // ── Cache Lookup: When not excluding recipes, check if identical query was cached ──
    const cacheKey = buildMatchCacheKey(input)
    if (exclude.length === 0) {
      const cached = recipeMatchCache.get(cacheKey)
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return NextResponse.json(
          { recipes: cached },
          {
            headers: {
              'X-Cache': 'HIT',
              'X-RateLimit-Limit': String(rateLimitResult.limit),
              'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            },
          }
        )
      }
    }

    const embedder = getEmbedder()
    let results = await matchRecipes(input, supabaseAdmin, embedder)

    // Filter out excluded IDs and names so "Find another recipe" never returns the same match
    if (exclude.length > 0) {
      results = results.filter((r) => !exclude.includes(r.id) && !exclude.includes(r.name))
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
          results = aiRecipes.map((ar: any) => ({
            id: ar.id,
            name: ar.name,
            category: ar.category,
            timeMinutes: ar.timeMinutes || ar.time_minutes || 15,
            diet: ar.diet,
            matchScore: ar.matchScore || ar.match_score || 90,
            matchedFromPantry: ar.matchedFromPantry || 0,
            matchedFromStaples: ar.matchedFromStaples || 0,
            requiredIngredientCount: ar.requiredIngredientCount || 0,
            missingIngredients: ar.missingIngredients || [],
            allIngredients: ar.allIngredients || ar.ingredients || [],
            steps: ar.steps || [],
            adapted: ar.adapted,
          }))
        }
      } catch (aiErr) {
        console.warn('[match-recipes] AI generation rollover failed:', aiErr)
      }
    }

    // Strict Diet Filtering: Exclude recipes that don't match the diet preference
    if (input.diet && input.diet !== 'all') {
      results = results.filter((r) => {
        const rDiet = (r.diet || '').toLowerCase()
        if (input.diet === 'veg') {
          return rDiet === 'veg' || rDiet === 'vegan' || rDiet === 'jain' || rDiet === 'vegetarian'
        }
        if (input.diet === 'vegan') {
          return rDiet === 'vegan'
        }
        if (input.diet === 'jain') {
          return rDiet === 'jain' || rDiet === 'vegan'
        }
        if (input.diet === 'non-veg') {
          return true
        }
        return rDiet === input.diet
      })
    }

    // Time-only query: flag ingredients as unconfirmed
    const isTimeOnly = (!input.ingredients || input.ingredients.length === 0) && input.time !== null
    if (isTimeOnly) {
      results = results.map((r) => ({
        ...r,
        allIngredients: (r.allIngredients || []).map((ing: any) => ({
          ...ing,
          unconfirmed: true,
        })),
      }))
    }

    // Store in cache for repeated user queries if not filtering out excluded IDs
    if (exclude.length === 0 && results.length > 0) {
      recipeMatchCache.set(cacheKey, results)
    }

    return NextResponse.json(
      { recipes: results },
      {
        headers: {
          'X-Cache': 'MISS',
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        },
      }
    )
  } catch (err) {
    console.error('[POST /api/match-recipes]', err)
    const isDev = process.env.NODE_ENV !== 'production'
    return NextResponse.json(
      {
        error: 'Failed to match recipes',
        ...(isDev ? { details: String(err) } : {}),
      },
      { status: 500 }
    )
  }
}
