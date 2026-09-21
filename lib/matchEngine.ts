/**
 * matchRecipes — Pure matching engine.
 *
 * Logic:
 *  1. HARD SQL FILTER: category, diet, time_minutes <= time + BUFFER
 *     Queries Supabase for stored catalogue recipes.
 *  2. If catalogue recipes exist: robust fuzzy/token matching + standing pantry staples.
 *  3. If no catalogue recipes match or exist: dynamically generates authentic recipes
 *     using the multi-model AI engine (Groq -> OpenRouter -> NVIDIA -> Gemini).
 *  4. Zero hardcoded seeds or generic template strings.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ingredientViolatesAllergies, isPantryStaple } from './useSettings'
import { generateRecipesWithAI } from './generateRecipes'

const TIME_BUFFER_MINUTES = 5

export interface MatchInput {
  time: number | null
  category: string | null
  ingredients: string[] | null
  diet: string | null
  servings: number
  allergies?: string[] | null
  region?: string | null
  pantryStaples?: string[] | null
}

export interface MatchedIngredient {
  name: string
  quantity: string
  optional: boolean
  unconfirmed?: boolean
}

export interface RecipeMatch {
  id: string
  name: string
  category: string
  timeMinutes: number
  diet: string
  matchScore: number
  missingIngredients: string[]
  allIngredients?: MatchedIngredient[]
}

export interface EmbeddingProvider {
  embedText(text: string): Promise<number[]>
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/ies\b/g, 'y')
    .replace(/es\b/g, '')
    .replace(/s\b/g, '')
    .replace(/[^a-z0-9 ]/g, '')
}

export function ingredientsMatch(a: string, b: string): boolean {
  const normA = normalizeIngredient(a)
  const normB = normalizeIngredient(b)
  if (!normA || !normB) return false
  if (normA === normB) return true
  if (normA.includes(normB) || normB.includes(normA)) return true

  const wordsA = normA.split(' ').filter((w) => w.length > 2)
  const wordsB = normB.split(' ').filter((w) => w.length > 2)
  return wordsA.some((w) => wordsB.includes(w))
}

export async function matchRecipes(
  input: MatchInput,
  supabase: SupabaseClient,
  embedder?: EmbeddingProvider
): Promise<RecipeMatch[]> {
  type Candidate = {
    id: string
    name: string
    category: string
    time_minutes: number
    diet: string
    region?: string | null
  }
  type IngRow = {
    name: string
    quantity: string
    optional: boolean
    embedding?: number[] | null
  }

  let candidates: Candidate[] = []
  const ingredientsByRecipe: Record<string, IngRow[]> = {}

  // ── STEP 1: CANDIDATE RETRIEVAL FROM SUPABASE ─────────────────────
  try {
    let query = supabase
      .from('recipes')
      .select('id, name, category, time_minutes, diet, region')

    if (input.category) {
      query = query.eq('category', input.category)
    }
    if (input.diet && input.diet !== 'all') {
      query = query.eq('diet', input.diet)
    }
    if (input.time !== null && input.time !== undefined) {
      query = query.lte('time_minutes', input.time + TIME_BUFFER_MINUTES)
    }

    const { data, error } = await query
    if (!error && data && data.length > 0) {
      candidates = data
      const candidateIds = candidates.map((r) => r.id)
      const { data: recipeIngData } = await supabase
        .from('recipe_ingredients')
        .select('recipe_id, quantity, optional, ingredients(id, name, embedding)')
        .in('recipe_id', candidateIds)

      if (recipeIngData) {
        for (const row of recipeIngData as any[]) {
          if (!ingredientsByRecipe[row.recipe_id]) {
            ingredientsByRecipe[row.recipe_id] = []
          }
          ingredientsByRecipe[row.recipe_id].push({
            name: row.ingredients?.name || '',
            quantity: row.quantity,
            optional: row.optional,
            embedding: row.ingredients?.embedding,
          })
        }
      }
    }
  } catch (err) {
    console.warn('[matchRecipes] Supabase query failed:', err)
  }

  // ── STEP 2: INGREDIENT MATCHING FOR DB CANDIDATES ─────────────────
  const userIngredients = (input.ingredients || []).map((s) => s.trim()).filter(Boolean)
  const hasIngredients = userIngredients.length > 0

  let queryEmbedding: number[] | null = null
  if (embedder && hasIngredients) {
    try {
      queryEmbedding = await embedder.embedText(userIngredients.join(', '))
    } catch {}
  }

  if (candidates.length > 0) {
    // If user provided no ingredients (e.g. time-only or diet-only query), return candidates directly
    if (!hasIngredients) {
      return candidates.map((candidate) => {
        const rows = ingredientsByRecipe[candidate.id] || []
        return {
          id: candidate.id,
          name: candidate.name,
          category: candidate.category,
          timeMinutes: candidate.time_minutes,
          diet: candidate.diet,
          matchScore: 1.0,
          missingIngredients: [],
          allIngredients: rows.map((r) => ({
            name: r.name,
            quantity: r.quantity,
            optional: r.optional,
            unconfirmed: true,
          })),
        }
      })
    }

    const results: RecipeMatch[] = []

    for (const candidate of candidates) {
      const rows = ingredientsByRecipe[candidate.id] || []

      if (input.allergies && input.allergies.length > 0) {
        const containsAllergen = rows.some((r) =>
          ingredientViolatesAllergies(r.name, input.allergies!)
        )
        if (containsAllergen) continue
      }

      const requiredRows = rows.filter((r) => !r.optional)
      const totalRequired = requiredRows.length

      if (totalRequired === 0) {
        results.push({
          id: candidate.id,
          name: candidate.name,
          category: candidate.category,
          timeMinutes: candidate.time_minutes,
          diet: candidate.diet,
          matchScore: 0.85,
          missingIngredients: [],
          allIngredients: rows.map((r) => ({
            name: r.name,
            quantity: r.quantity,
            optional: r.optional,
          })),
        })
        continue
      }

      const missing: string[] = []
      let matchedRequired = 0

      for (const row of requiredRows) {
        const inPantry = input.pantryStaples && isPantryStaple(row.name, input.pantryStaples)
        if (inPantry) {
          matchedRequired++
          continue
        }

        const isMatched =
          (queryEmbedding && row.embedding && cosineSimilarity(queryEmbedding, row.embedding) >= 0.78) ||
          userIngredients.some((userIng) => ingredientsMatch(row.name, userIng))

        if (isMatched) {
          matchedRequired++
        } else {
          missing.push(row.name)
        }
      }

      let scannedUsed = 0
      for (const userIng of userIngredients) {
        if (
          rows.some(
            (r) =>
              (queryEmbedding && r.embedding && cosineSimilarity(queryEmbedding, r.embedding) >= 0.78) ||
              ingredientsMatch(r.name, userIng)
          )
        ) {
          scannedUsed++
        }
      }

      let matchScore = totalRequired > 0 ? matchedRequired / totalRequired : 1.0

      if (input.region && input.region !== 'all' && candidate.region === input.region) {
        matchScore = Math.min(1, matchScore + 0.05)
      }

      if (matchedRequired > 0 || scannedUsed > 0 || matchScore >= 0.25) {
        results.push({
          id: candidate.id,
          name: candidate.name,
          category: candidate.category,
          timeMinutes: candidate.time_minutes,
          diet: candidate.diet,
          matchScore: Math.round(matchScore * 100) / 100,
          missingIngredients: missing,
          allIngredients: rows.map((r) => ({
            name: r.name,
            quantity: r.quantity,
            optional: r.optional,
          })),
        })
      }
    }

    if (results.length > 0) {
      results.sort((a, b) => b.matchScore - a.matchScore)
      return results.slice(0, 6)
    }
  }

  // ── STEP 3: DYNAMIC AI RECIPE GENERATION ─────────────────────────
  // If DB returned no matching candidates, generate fresh, authentic recipes with AI
  console.log('[matchRecipes] Generating tailored recipes with AI for:', userIngredients)
  try {
    const aiResults = await generateRecipesWithAI({
      ingredients: userIngredients.length > 0 ? userIngredients : null,
      category: input.category,
      diet: input.diet,
      time: input.time,
      servings: input.servings,
      region: input.region,
      allergies: input.allergies,
      count: 4,
    })

    if (aiResults.length > 0) {
      return aiResults.map((ar: any) => ({
        id: ar.id,
        name: ar.name,
        category: ar.category,
        timeMinutes: ar.timeMinutes || ar.time_minutes || 15,
        diet: ar.diet,
        matchScore: ar.matchScore || ar.match_score || 90,
        missingIngredients: ar.missingIngredients || [],
        allIngredients: ar.allIngredients || ar.ingredients || [],
        steps: ar.steps || [],
        adapted: ar.adapted,
      }))
    }
  } catch (err) {
    console.error('[matchRecipes] AI recipe generation failed:', err)
  }

  // Time-only DB candidates fallback
  if (candidates.length > 0) {
    return candidates.map((candidate) => {
      const rows = ingredientsByRecipe[candidate.id] || []
      return {
        id: candidate.id,
        name: candidate.name,
        category: candidate.category,
        timeMinutes: candidate.time_minutes,
        diet: candidate.diet,
        matchScore: 0.8,
        missingIngredients: [],
        allIngredients: rows.map((r) => ({
          name: r.name,
          quantity: r.quantity,
          optional: r.optional,
        })),
      }
    }).slice(0, 5)
  }

  return []
}
