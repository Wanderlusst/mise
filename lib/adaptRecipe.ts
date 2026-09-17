/**
 * adaptRecipe — Pure adaptation engine.
 * Fetches a full recipe from Supabase, calls the Groq LLM to adapt it for
 * the user's available ingredients, servings, and time constraint.
 *
 * Guarantees:
 *  - Defensive JSON parse with 1 retry on network failure
 *  - Protein step guardrail (TypeScript, not LLM-trusted)
 *  - Always returns a usable AdaptedRecipe, even on LLM failure
 */

import { SupabaseClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────
export interface RecipeStep {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number | null
  parallel: boolean
}

export interface RecipeIngredient {
  name: string
  quantity: string
  optional: boolean
}

export interface FullRecipe {
  id: string
  name: string
  category: string
  diet: string
  region: string | null
  time_minutes: number
  difficulty: string
  servings: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
}

export interface AdaptedRecipe extends FullRecipe {
  adapted: boolean
  adaptationReason?: string
  substitutions?: Array<{ original: string; substitute: string; note: string }>
}

export interface AdaptInput {
  recipeId: string
  ingredients: string[]
  servings: number
  timeConstraint: number | null
}

// ──────────────────────────────────────────────────────────────────
// Protein keyword guard — TypeScript, not LLM-trusted
// ──────────────────────────────────────────────────────────────────
const PROTEIN_KEYWORDS = [
  'chicken', 'beef', 'pork', 'lamb', 'mutton', 'fish', 'salmon',
  'tuna', 'prawn', 'shrimp', 'egg', 'turkey', 'duck',
]
const COOK_ACTION_KEYWORDS = [
  'grill', 'fry', 'roast', 'bake', 'cook', 'boil', 'simmer',
  'sear', 'steam', 'poach', 'braise',
]

function isProteinCookStep(step: RecipeStep): boolean {
  const lower = step.instruction.toLowerCase()
  const hasProtein = PROTEIN_KEYWORDS.some((k) => lower.includes(k))
  const hasCookAction = COOK_ACTION_KEYWORDS.some((k) => lower.includes(k))
  return hasProtein && hasCookAction
}

/**
 * Guardrail: checks that no protein cook step lost its duration or had
 * its instruction text gutted. Returns true if the adapted recipe is safe.
 */
export function passesProteinGuardrail(
  original: FullRecipe,
  adapted: AdaptedRecipe
): boolean {
  const originalProteinSteps = original.steps.filter(isProteinCookStep)
  if (originalProteinSteps.length === 0) return true // no protein steps, always safe

  for (const origStep of originalProteinSteps) {
    const adaptedStep = adapted.steps.find(
      (s) => s.step_order === origStep.step_order
    )
    if (!adaptedStep) {
      console.error(
        `[guardrail] Protein step #${origStep.step_order} missing in adapted recipe`
      )
      return false
    }
    // Check duration
    if (
      adaptedStep.duration_minutes === null ||
      adaptedStep.duration_minutes === undefined ||
      adaptedStep.duration_minutes <= 0
    ) {
      console.error(
        `[guardrail] Protein step #${origStep.step_order} lost its duration. ` +
          `Original: ${origStep.duration_minutes}min, Adapted: ${adaptedStep.duration_minutes}`
      )
      return false
    }
    // Check that a cook-action keyword still exists
    const lowerAdapted = adaptedStep.instruction.toLowerCase()
    const hasCookAction = COOK_ACTION_KEYWORDS.some((k) => lowerAdapted.includes(k))
    if (!hasCookAction) {
      console.error(
        `[guardrail] Protein step #${origStep.step_order} lost its cook instruction. ` +
          `Adapted text: "${adaptedStep.instruction}"`
      )
      return false
    }
  }
  return true
}

// ──────────────────────────────────────────────────────────────────
// JSON parse helpers
// ──────────────────────────────────────────────────────────────────
function stripCodeFences(raw: string): string {
  // Strip ```json ... ``` or ``` ... ```
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

function tryParseAdaptedRecipe(raw: string): AdaptedRecipe | null {
  try {
    const cleaned = stripCodeFences(raw)
    const parsed = JSON.parse(cleaned)
    // Minimal shape validation
    if (
      parsed &&
      Array.isArray(parsed.steps) &&
      Array.isArray(parsed.ingredients)
    ) {
      return parsed as AdaptedRecipe
    }
    return null
  } catch {
    return null
  }
}

// ──────────────────────────────────────────────────────────────────
// LLM call with retry
// ──────────────────────────────────────────────────────────────────
export interface LLMProvider {
  complete(systemPrompt: string, userPrompt: string): Promise<string>
}

export class GroqLLMProvider implements LLMProvider {
  private client: Groq

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey })
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    })
    return response.choices[0]?.message?.content ?? ''
  }
}

export class GeminiLLMProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'gemini-3.5-flash-lite') {
    this.apiKey = apiKey
    this.model = model
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Gemini API error (${res.status}): ${errBody}`)
    }

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }
}

export class FallbackLLMProvider implements LLMProvider {
  private primary: LLMProvider
  private backup: LLMProvider

  constructor(primary: LLMProvider, backup: LLMProvider) {
    this.primary = primary
    this.backup = backup
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const res = await this.primary.complete(systemPrompt, userPrompt)
      if (res && res.trim().length > 0) {
        return res
      }
      throw new Error('Primary LLM returned empty response')
    } catch (primaryErr) {
      console.warn('[adaptRecipe] Primary LLM failed, using backup Gemini LLM:', primaryErr)
      return await this.backup.complete(systemPrompt, userPrompt)
    }
  }
}


async function callLLMWithRetry(
  llm: LLMProvider,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 1
): Promise<string | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await llm.complete(systemPrompt, userPrompt)
    } catch (err) {
      if (attempt === maxRetries) {
        console.error('[adapt-recipe] LLM call failed after retries:', err)
        return null
      }
      console.warn(`[adapt-recipe] LLM attempt ${attempt + 1} failed, retrying...`, err)
    }
  }
  return null
}

// ──────────────────────────────────────────────────────────────────
// Main pure function
// ──────────────────────────────────────────────────────────────────
export async function adaptRecipe(
  input: AdaptInput,
  supabase: SupabaseClient,
  llm: LLMProvider
): Promise<AdaptedRecipe> {
  // 1. Fetch full recipe from Supabase
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', input.recipeId)
    .single()

  if (recipeError || !recipe) {
    throw new Error(`Recipe not found: ${recipeError?.message ?? 'no data'}`)
  }

  const { data: stepsData, error: stepsError } = await supabase
    .from('recipe_steps')
    .select('*')
    .eq('recipe_id', input.recipeId)
    .order('step_order', { ascending: true })

  if (stepsError) throw new Error(`Steps fetch error: ${stepsError.message}`)

  const { data: ingData, error: ingError } = await supabase
    .from('recipe_ingredients')
    .select('quantity, optional, ingredients(name)')
    .eq('recipe_id', input.recipeId)

  if (ingError) throw new Error(`Ingredients fetch error: ${ingError.message}`)

  type IngJoin = { quantity: string; optional: boolean; ingredients: { name: string } }

  const fullRecipe: FullRecipe = {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    diet: recipe.diet,
    region: recipe.region,
    time_minutes: recipe.time_minutes,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    ingredients: (ingData as unknown as IngJoin[]).map((r) => ({
      name: r.ingredients.name,
      quantity: r.quantity,
      optional: r.optional,
    })),
    steps: stepsData as RecipeStep[],
  }

  const fallback: AdaptedRecipe = {
    ...fullRecipe,
    adapted: false,
  }

  // 2. Build LLM prompt
  const systemPrompt = `You are a professional chef assistant. 
Return ONLY valid JSON — no prose, no markdown code fences, no explanation.
The JSON must match this exact shape:
{
  "id": "string",
  "name": "string",
  "category": "string",
  "diet": "string",
  "region": "string or null",
  "time_minutes": number,
  "difficulty": "string",
  "servings": number,
  "ingredients": [{"name": "string", "quantity": "string", "optional": boolean}],
  "steps": [{"id": "string", "step_order": number, "instruction": "string", "duration_minutes": number, "parallel": boolean}],
  "adapted": true,
  "substitutions": [{"original": "string", "substitute": "string", "note": "string"}]
}
Rules:
- Adjust ingredient quantities proportionally if servings change.
- Suggest up to 2 substitutions ONLY for missing non-critical ingredients; keep substitutions realistic.
- Keep steps in the same order; only reword steps affected by a substitution.
- NEVER remove or reduce the duration of any step involving cooking meat, poultry, fish, or eggs.
- The "steps" array must preserve all original step_order values and duration_minutes.`

  const userPrompt = `Original recipe JSON:
${JSON.stringify(fullRecipe, null, 2)}

User's available ingredients: ${input.ingredients.join(', ')}
Requested servings: ${input.servings}
${input.timeConstraint ? `Time constraint: ${input.timeConstraint} minutes` : ''}

Adapt the recipe and return the JSON.`

  // 3. Call LLM with retry
  const rawResponse = await callLLMWithRetry(llm, systemPrompt, userPrompt)

  if (!rawResponse) {
    return { ...fallback, adaptationReason: 'LLM unavailable after retry' }
  }

  // 4. Defensive parse
  const parsed = tryParseAdaptedRecipe(rawResponse)

  if (!parsed) {
    console.error('[adapt-recipe] Failed to parse LLM response:', rawResponse)
    return {
      ...fallback,
      adaptationReason: 'LLM returned unparseable response',
    }
  }

  // Ensure adapted flag is set
  parsed.adapted = true

  // 5. Protein guardrail (TypeScript, not LLM-trusted)
  if (!passesProteinGuardrail(fullRecipe, parsed)) {
    console.error('[adapt-recipe] Protein guardrail failed — falling back to original')
    return {
      ...fallback,
      adaptationReason:
        'Adapted recipe failed protein cook-time safety check; using original.',
    }
  }

  return parsed
}
