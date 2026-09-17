/**
 * matchRecipes — Pure matching engine.
 * Importable independently for unit testing with a mock Supabase client.
 *
 * Logic (strictly in order):
 *  1. HARD SQL FILTER: category, diet, time_minutes <= time + BUFFER
 *  2a. IF ingredients given: embed once, cosine match per candidate,
 *      compute matchScore, drop recipes missing >2 required ingredients
 *  2b. IF no ingredients: return top-5 by time fit, all ingredients
 *      flagged unconfirmed=true
 *  3. Sort by matchScore (or time fit), return top 5
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ingredientViolatesAllergies, isPantryStaple } from './useSettings'

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

/**
 * Minimal interface for an embedding provider.
 * Allows injecting a mock in tests.
 */
export interface EmbeddingProvider {
  embedText(text: string): Promise<number[]>
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
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

export async function matchRecipes(
  input: MatchInput,
  supabase: SupabaseClient,
  embedder?: EmbeddingProvider
): Promise<RecipeMatch[]> {
  // ── STEP 1: HARD SQL FILTER ──────────────────────────────────────
  let query = supabase
    .from('recipes')
    .select('id, name, category, time_minutes, diet, region')

  if (input.category) {
    query = query.eq('category', input.category)
  }
  if (input.diet && input.diet !== 'all') {
    query = query.eq('diet', input.diet)
  }
  // Only apply time filter if time was explicitly provided
  if (input.time !== null && input.time !== undefined) {
    query = query.lte('time_minutes', input.time + TIME_BUFFER_MINUTES)
  }

  const { data: candidates, error } = await query

  if (error) {
    throw new Error(`Supabase filter error: ${error.message}`)
  }
  if (!candidates || candidates.length === 0) {
    return []
  }

  // ── STEP 2: INGREDIENT MATCHING ──────────────────────────────────
  const hasIngredients =
    input.ingredients && input.ingredients.length > 0

  // Fetch ingredients for all surviving candidates
  const candidateIds = candidates.map((r: { id: string }) => r.id)
  const { data: recipeIngData, error: riError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, quantity, optional, ingredients(id, name, embedding)')
    .in('recipe_id', candidateIds)

  if (riError) {
    throw new Error(`Supabase ingredients error: ${riError.message}`)
  }

  // Group ingredients by recipe
  type IngRow = {
    recipe_id: string
    quantity: string
    optional: boolean
    ingredients: { id: string; name: string; embedding: number[] | null }
  }
  const ingredientsByRecipe: Record<string, IngRow[]> = {}
  for (const row of (recipeIngData || []) as unknown as IngRow[]) {
    if (!ingredientsByRecipe[row.recipe_id]) {
      ingredientsByRecipe[row.recipe_id] = []
    }
    ingredientsByRecipe[row.recipe_id].push(row)
  }

  // ── STEP 2a: ingredient-first path ──────────────────────────────
  if (hasIngredients && embedder) {
    const inputText = input.ingredients!.join(', ')
    const queryEmbedding = await embedder.embedText(inputText)

    const results: RecipeMatch[] = []

    for (const candidate of candidates) {
      const rows = ingredientsByRecipe[candidate.id] || []

      // Check allergy restrictions: skip recipe if it contains any allergen
      if (input.allergies && input.allergies.length > 0) {
        const containsAllergen = rows.some((r) =>
          ingredientViolatesAllergies(r.ingredients.name, input.allergies!)
        )
        if (containsAllergen) continue
      }

      const requiredRows = rows.filter((r) => !r.optional)
      const totalRequired = requiredRows.length

      if (totalRequired === 0) {
        // Recipe has no required ingredients — treat as full match
        results.push({
          id: candidate.id,
          name: candidate.name,
          category: candidate.category,
          timeMinutes: candidate.time_minutes,
          diet: candidate.diet,
          matchScore: 1,
          missingIngredients: [],
          allIngredients: rows.map((r) => ({
            name: r.ingredients.name,
            quantity: r.quantity,
            optional: r.optional,
          })),
        })
        continue
      }

      // Compute cosine similarity of each required ingredient against query
      const missing: string[] = []
      let matched = 0

      for (const row of requiredRows) {
        // Standing pantry: don't ding for staples the user always has on hand
        const inPantry = input.pantryStaples && isPantryStaple(row.ingredients.name, input.pantryStaples)
        if (inPantry) {
          matched++
          continue
        }

        const ingEmbedding = row.ingredients.embedding
        if (!ingEmbedding) {
          // No embedding yet — conservatively treat as missing
          missing.push(row.ingredients.name)
          continue
        }
        const sim = cosineSimilarity(queryEmbedding, ingEmbedding)
        // Similarity threshold: 0.78 is a good cutoff for ingredient name matching
        if (sim >= 0.78) {
          matched++
        } else {
          missing.push(row.ingredients.name)
        }
      }

      // Drop recipes missing more than 2 required ingredients
      if (missing.length > 2) continue

      let matchScore = matched / totalRequired

      // Region tiebreaker: small score boost if candidate matches user's preferred region
      if (input.region && input.region !== 'all' && (candidate as { region?: string | null }).region === input.region) {
        matchScore = Math.min(1, matchScore + 0.05)
      }

      results.push({
        id: candidate.id,
        name: candidate.name,
        category: candidate.category,
        timeMinutes: candidate.time_minutes,
        diet: candidate.diet,
        matchScore,
        missingIngredients: missing,
        allIngredients: rows.map((r) => ({
          name: r.ingredients.name,
          quantity: r.quantity,
          optional: r.optional,
        })),
      })
    }

    // Sort by matchScore descending, return top 5
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
  }

  // ── STEP 2b: time-only path (no ingredients) ─────────────────────
  // Return all survivors sorted by how well they fit the time window.
  // All ingredients are flagged unconfirmed=true.
  const timeOnlyResults: RecipeMatch[] = candidates
    .filter((candidate: { id: string }) => {
      // Filter allergies in time-only mode as well
      if (input.allergies && input.allergies.length > 0) {
        const rows = ingredientsByRecipe[candidate.id] || []
        const containsAllergen = rows.some((r) =>
          ingredientViolatesAllergies(r.ingredients.name, input.allergies!)
        )
        if (containsAllergen) return false
      }
      return true
    })
    .map(
      (candidate: { id: string; name: string; category: string; time_minutes: number; diet: string; region?: string | null }) => {
        const rows = ingredientsByRecipe[candidate.id] || []
        let matchScore =
          input.time !== null
            ? 1 - candidate.time_minutes / (input.time + TIME_BUFFER_MINUTES)
            : 0.5

        // Region tiebreaker
        if (input.region && input.region !== 'all' && candidate.region === input.region) {
          matchScore = Math.min(1, matchScore + 0.05)
        }

        return {
          id: candidate.id,
          name: candidate.name,
          category: candidate.category,
          timeMinutes: candidate.time_minutes,
          diet: candidate.diet,
          matchScore,
          missingIngredients: [],
          allIngredients: rows.map((r) => ({
            name: r.ingredients.name,
            quantity: r.quantity,
            optional: r.optional,
            unconfirmed: true,
          })),
        }
      }
    )

  return timeOnlyResults
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}
