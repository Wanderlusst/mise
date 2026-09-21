/**
 * adaptRecipe.test.ts
 *
 * Tests the pure adaptRecipe function with 3 cases:
 *  1. Happy path — LLM returns valid JSON, recipe is adapted
 *  2. Malformed JSON — falls back to original, adapted=false
 *  3. Protein guardrail — adapted recipe drops cook duration,
 *     guardrail catches it and returns original
 */

import { adaptRecipe, passesProteinGuardrail, LLMProvider, FullRecipe, AdaptedRecipe } from '../lib/adaptRecipe'
import { SupabaseClient } from '@supabase/supabase-js'

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────
const FULL_RECIPE: FullRecipe = {
  id: 'recipe-123',
  name: 'Chicken Stir Fry',
  category: 'meal',
  diet: 'non-veg',
  region: 'Chinese',
  time_minutes: 25,
  difficulty: 'medium',
  servings: 2,
  ingredients: [
    { name: 'chicken breast', quantity: '300g', optional: false },
    { name: 'bell pepper', quantity: '1', optional: false },
    { name: 'oyster sauce', quantity: '1 tbsp', optional: true },
    { name: 'soy sauce', quantity: '3 tbsp', optional: false },
  ],
  steps: [
    {
      id: 's1',
      step_order: 1,
      instruction: 'Marinate chicken breast in soy sauce and cornstarch for 10 minutes.',
      duration_minutes: 10,
      parallel: false,
    },
    {
      id: 's2',
      step_order: 2,
      instruction: 'Stir-fry marinated chicken in hot oil for 6 minutes until fully cooked through (internal temp 75°C).',
      duration_minutes: 6,
      parallel: false,
    },
    {
      id: 's3',
      step_order: 3,
      instruction: 'Add vegetables and stir-fry 3 minutes. Add soy sauce. Serve.',
      duration_minutes: 3,
      parallel: false,
    },
  ],
}

// ──────────────────────────────────────────────────────────────────
// Mock Supabase builder
// ──────────────────────────────────────────────────────────────────
function buildSupabaseMock(recipe = FULL_RECIPE): SupabaseClient {
  const stepsData = recipe.steps
  const ingData = recipe.ingredients.map((i) => ({
    quantity: i.quantity,
    optional: i.optional,
    ingredients: { name: i.name },
  }))

  return {
    from: jest.fn().mockImplementation((table: string) => {
      if (table === 'recipes') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: recipe.id,
                  name: recipe.name,
                  category: recipe.category,
                  diet: recipe.diet,
                  region: recipe.region,
                  time_minutes: recipe.time_minutes,
                  difficulty: recipe.difficulty,
                  servings: recipe.servings,
                },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'recipe_steps') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: stepsData, error: null }),
            }),
          }),
        }
      }
      if (table === 'recipe_ingredients') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: ingData, error: null }),
          }),
        }
      }
      return {}
    }),
  } as unknown as SupabaseClient
}

// ──────────────────────────────────────────────────────────────────
// Mock LLM providers
// ──────────────────────────────────────────────────────────────────
function goodLLM(): LLMProvider {
  const adaptedRecipe: AdaptedRecipe = {
    ...FULL_RECIPE,
    servings: 4,
    adapted: true,
    ingredients: [
      { name: 'chicken breast', quantity: '600g', optional: false },
      { name: 'bell pepper', quantity: '2', optional: false },
      { name: 'soy sauce', quantity: '6 tbsp', optional: false },
      // oyster sauce substituted
    ],
    steps: [
      {
        id: 's1',
        step_order: 1,
        instruction: 'Marinate chicken breast in soy sauce and cornstarch for 10 minutes.',
        duration_minutes: 10,
        parallel: false,
      },
      {
        id: 's2',
        step_order: 2,
        instruction: 'Stir-fry marinated chicken in hot oil for 6 minutes until fully cooked through (internal temp 75°C).',
        duration_minutes: 6,
        parallel: false,
      },
      {
        id: 's3',
        step_order: 3,
        instruction: 'Add vegetables and stir-fry 3 minutes. Add soy sauce. Serve.',
        duration_minutes: 3,
        parallel: false,
      },
    ],
    substitutions: [
      { original: 'oyster sauce', substitute: 'hoisin sauce', note: 'Use same quantity' },
    ],
  }
  return {
    complete: jest.fn().mockResolvedValue(JSON.stringify(adaptedRecipe)),
  }
}

function malformedLLM(): LLMProvider {
  return {
    complete: jest.fn().mockResolvedValue(
      'Sure! Here is the adapted recipe for you. Unfortunately I cannot return JSON right now. The chicken should cook for a while.'
    ),
  }
}

function guardRailViolatingLLM(): LLMProvider {
  // Returns valid JSON but strips duration and cook instruction from protein step
  const badAdapted: AdaptedRecipe = {
    ...FULL_RECIPE,
    adapted: true,
    steps: [
      {
        id: 's1',
        step_order: 1,
        instruction: 'Marinate chicken in soy sauce.',
        duration_minutes: 10,
        parallel: false,
      },
      {
        id: 's2',
        step_order: 2,
        // ❌ cook instruction removed, duration set to 0
        instruction: 'Add chicken to the dish.',
        duration_minutes: 0,
        parallel: false,
      },
      {
        id: 's3',
        step_order: 3,
        instruction: 'Add vegetables and soy sauce. Serve.',
        duration_minutes: 3,
        parallel: false,
      },
    ],
  }
  return {
    complete: jest.fn().mockResolvedValue(JSON.stringify(badAdapted)),
  }
}

// ──────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────
describe('adaptRecipe()', () => {
  const input = {
    recipeId: 'recipe-123',
    ingredients: ['chicken breast', 'bell pepper', 'soy sauce', 'hoisin sauce'],
    servings: 4,
    timeConstraint: null,
  }

  // ── Test 1: Happy path ──────────────────────────────────────────
  it('happy path: returns adapted recipe with adapted=true', async () => {
    const supabase = buildSupabaseMock()
    const llm = goodLLM()

    const result = await adaptRecipe(input, supabase, llm)

    expect(result.adapted).toBe(true)
    expect(result.name).toBe('Chicken Stir Fry')
    expect(result.servings).toBe(4)
    // LLM was called
    expect((llm.complete as jest.Mock).mock.calls.length).toBe(1)
  })

  // ── Test 2: Malformed JSON ──────────────────────────────────────
  it('malformed JSON: returns original recipe with adapted=false', async () => {
    const supabase = buildSupabaseMock()
    const llm = malformedLLM()

    const result = await adaptRecipe(input, supabase, llm)

    expect(result.adapted).toBe(false)
    expect(result.adaptationReason).toBeTruthy()
    // Ingredients and steps should match original
    expect(result.steps.length).toBe(FULL_RECIPE.steps.length)
    expect(result.ingredients.length).toBe(FULL_RECIPE.ingredients.length)
    // Original servings preserved
    expect(result.servings).toBe(FULL_RECIPE.servings)
  })

  // ── Test 3: Protein guardrail ───────────────────────────────────
  it('protein guardrail: adapted recipe with missing cook duration falls back to original', async () => {
    const supabase = buildSupabaseMock()
    const llm = guardRailViolatingLLM()

    const result = await adaptRecipe(input, supabase, llm)

    // Guardrail should have caught step 2 (chicken stir-fry) losing its duration + cook action
    expect(result.adapted).toBe(false)
    expect(result.adaptationReason).toMatch(/protein/i)

    // Steps should be originals (with correct duration)
    const proteinStep = result.steps.find((s) => s.step_order === 2)
    expect(proteinStep?.duration_minutes).toBe(6)
    expect(proteinStep?.instruction).toContain('75°C')
  })
})

// ── Standalone guardrail unit tests ────────────────────────────────
describe('passesProteinGuardrail()', () => {
  it('passes when no protein steps exist', () => {
    const veganRecipe: FullRecipe = {
      ...FULL_RECIPE,
      diet: 'vegan',
      steps: [
        { id: 's1', step_order: 1, instruction: 'Boil pasta in salted water.', duration_minutes: 10, parallel: false },
      ],
    }
    const adapted: AdaptedRecipe = { ...veganRecipe, adapted: true }
    expect(passesProteinGuardrail(veganRecipe, adapted)).toBe(true)
  })

  it('fails when protein step loses duration', () => {
    const adapted: AdaptedRecipe = {
      ...FULL_RECIPE,
      adapted: true,
      steps: [
        FULL_RECIPE.steps[0],
        { ...FULL_RECIPE.steps[1], duration_minutes: 0 }, // ❌ zeroed
        FULL_RECIPE.steps[2],
      ],
    }
    expect(passesProteinGuardrail(FULL_RECIPE, adapted)).toBe(false)
  })

  it('fails when protein step loses cook instruction', () => {
    const adapted: AdaptedRecipe = {
      ...FULL_RECIPE,
      adapted: true,
      steps: [
        FULL_RECIPE.steps[0],
        { ...FULL_RECIPE.steps[1], instruction: 'Add chicken to the bowl.' }, // ❌ no cook verb
        FULL_RECIPE.steps[2],
      ],
    }
    expect(passesProteinGuardrail(FULL_RECIPE, adapted)).toBe(false)
  })

  it('passes when protein step retains duration and cook instruction', () => {
    const adapted: AdaptedRecipe = { ...FULL_RECIPE, adapted: true }
    expect(passesProteinGuardrail(FULL_RECIPE, adapted)).toBe(true)
  })
})

describe('FallbackLLMProvider', () => {
  it('uses primary provider when primary succeeds', async () => {
    const primary: LLMProvider = {
      complete: jest.fn().mockResolvedValue('{"adapted": true, "steps": [], "ingredients": []}'),
    }
    const backup: LLMProvider = {
      complete: jest.fn().mockResolvedValue('backup-response'),
    }

    const { FallbackLLMProvider } = await import('../lib/adaptRecipe')
    const provider = new FallbackLLMProvider(primary, backup)
    const result = await provider.complete('system prompt', 'user prompt')

    expect(result).toBe('{"adapted": true, "steps": [], "ingredients": []}')
    expect(primary.complete).toHaveBeenCalledTimes(1)
    expect(backup.complete).not.toHaveBeenCalled()
  })

  it('falls back to backup provider when primary throws an error', async () => {
    const primary: LLMProvider = {
      complete: jest.fn().mockRejectedValue(new Error('Rate limit exceeded')),
    }
    const backup: LLMProvider = {
      complete: jest.fn().mockResolvedValue('backup-response'),
    }

    const { FallbackLLMProvider } = await import('../lib/adaptRecipe')
    const provider = new FallbackLLMProvider(primary, backup)
    const result = await provider.complete('system prompt', 'user prompt')

    expect(result).toBe('backup-response')
    expect(primary.complete).toHaveBeenCalledTimes(1)
    expect(backup.complete).toHaveBeenCalledTimes(1)
  })

  it('falls back to backup provider when primary returns an empty response', async () => {
    const primary: LLMProvider = {
      complete: jest.fn().mockResolvedValue('   '),
    }
    const backup: LLMProvider = {
      complete: jest.fn().mockResolvedValue('backup-response-from-empty'),
    }

    const { FallbackLLMProvider } = await import('../lib/adaptRecipe')
    const provider = new FallbackLLMProvider(primary, backup)
    const result = await provider.complete('system prompt', 'user prompt')

    expect(result).toBe('backup-response-from-empty')
    expect(primary.complete).toHaveBeenCalledTimes(1)
    expect(backup.complete).toHaveBeenCalledTimes(1)
  })
})

describe('QA Part 2 — Protein Step Guardrail Sneak Prevention', () => {
  it('blocks an LLM response that tries to sneak past by slashing chicken cook duration from 6m to 1m', async () => {
    const sneakyLLMResponse = JSON.stringify({
      id: FULL_RECIPE.id,
      name: 'Quick Chicken Stir Fry',
      category: 'meal',
      diet: 'non-veg',
      time_minutes: 10,
      difficulty: 'easy',
      servings: 2,
      ingredients: FULL_RECIPE.ingredients,
      steps: [
        FULL_RECIPE.steps[0],
        {
          id: 's2',
          step_order: 2,
          instruction: 'Flash-sear the raw chicken for just 1 minute.', // ❌ dangerous 1 min cook time
          duration_minutes: 1,
          parallel: false,
        },
        FULL_RECIPE.steps[2],
      ],
      adapted: true,
    })

    const llm: LLMProvider = {
      complete: jest.fn().mockResolvedValue(sneakyLLMResponse),
    }

    const supabase = buildSupabaseMock()
    const result = await adaptRecipe(
      { recipeId: FULL_RECIPE.id, ingredients: ['bell pepper'], servings: 2, timeConstraint: 10 },
      supabase,
      llm
    )

    // Guardrail caught the modification: returned original with adapted: false
    expect(result.adapted).toBe(false)
    expect(result.adaptationReason).toContain('Protein cooking times could not be safely modified')
    expect(result.steps[1].duration_minutes).toBe(6) // Retained safe 6 minutes
  })
})

describe('QA Part 2 — Retry-Once-Then-Fallback Behavior', () => {
  it('retries exactly once (2 calls total) on simulated network failure before giving up', async () => {
    const { callLLMWithRetry } = await import('../lib/adaptRecipe')
    const failingLLM: LLMProvider = {
      complete: jest.fn().mockRejectedValue(new Error('Network ETIMEDOUT')),
    }

    const result = await callLLMWithRetry(failingLLM, 'system prompt', 'user prompt', 1)

    expect(result).toBeNull()
    // Exactly 2 calls: attempt 0 (initial) + attempt 1 (single retry)
    expect(failingLLM.complete).toHaveBeenCalledTimes(2)
  })

  it('recovers successfully on the second attempt if the first attempt fails', async () => {
    const { callLLMWithRetry } = await import('../lib/adaptRecipe')
    const transientLLM: LLMProvider = {
      complete: jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary 503 Server Busy'))
        .mockResolvedValueOnce('{"recovered": true}'),
    }

    const result = await callLLMWithRetry(transientLLM, 'system prompt', 'user prompt', 1)

    expect(result).toBe('{"recovered": true}')
    expect(transientLLM.complete).toHaveBeenCalledTimes(2)
  })
})


