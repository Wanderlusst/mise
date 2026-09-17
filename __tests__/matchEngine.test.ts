/**
 * matchEngine.test.ts
 *
 * Tests the pure matchRecipes function with 4 cases:
 *  1. Time-only query
 *  2. Ingredients-only query
 *  3. Both time and ingredients
 *  4. Diet exclusion
 *
 * All Supabase calls are mocked — no real DB needed.
 */

import { matchRecipes, MatchInput, EmbeddingProvider } from '../lib/matchEngine'
import { SupabaseClient } from '@supabase/supabase-js'

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────
const RECIPE_DRINK_5MIN = { id: 'r-drink-1', name: 'Mint Tang Iced Cooler', category: 'drink', diet: 'vegan', time_minutes: 5 }
const RECIPE_DRINK_10MIN = { id: 'r-drink-2', name: 'Classic Mint Lemonade', category: 'drink', diet: 'vegan', time_minutes: 10 }
const RECIPE_MEAL_30MIN = { id: 'r-meal-1', name: 'Dal Tadka', category: 'meal', diet: 'vegan', time_minutes: 30 }

function fakeEmbedding(seed: number): number[] {
  const v = new Array(1536).fill(0)
  v[seed % 1536] = 1.0
  return v
}

const ING_ICE = { id: 'i-1', name: 'ice cubes', embedding: fakeEmbedding(1) }
const ING_LEMON = { id: 'i-2', name: 'lemon juice', embedding: fakeEmbedding(2) }
const ING_TANG = { id: 'i-3', name: 'tang orange powder', embedding: fakeEmbedding(3) }
const ING_MINT = { id: 'i-4', name: 'mint leaves', embedding: fakeEmbedding(4) }
const ING_WATER = { id: 'i-5', name: 'cold water', embedding: fakeEmbedding(5) }
const ING_LENTILS = { id: 'i-8', name: 'yellow lentils', embedding: fakeEmbedding(8) }

const RI_DRINK1 = [
  { recipe_id: 'r-drink-1', quantity: '3 tbsp', optional: false, ingredients: ING_TANG },
  { recipe_id: 'r-drink-1', quantity: '1 cup', optional: false, ingredients: ING_ICE },
  { recipe_id: 'r-drink-1', quantity: '10 leaves', optional: false, ingredients: ING_MINT },
  { recipe_id: 'r-drink-1', quantity: '300 ml', optional: false, ingredients: ING_WATER },
  { recipe_id: 'r-drink-1', quantity: '1 tbsp', optional: false, ingredients: ING_LEMON },
]
const RI_DRINK2 = [
  { recipe_id: 'r-drink-2', quantity: '4 whole', optional: false, ingredients: ING_LEMON },
  { recipe_id: 'r-drink-2', quantity: '20 leaves', optional: false, ingredients: ING_MINT },
  { recipe_id: 'r-drink-2', quantity: '2 cups', optional: false, ingredients: ING_ICE },
  { recipe_id: 'r-drink-2', quantity: '500 ml', optional: false, ingredients: ING_WATER },
]
const RI_MEAL = [
  { recipe_id: 'r-meal-1', quantity: '1 cup', optional: false, ingredients: ING_LENTILS },
  { recipe_id: 'r-meal-1', quantity: '500 ml', optional: false, ingredients: ING_WATER },
]

// ──────────────────────────────────────────────────────────────────
// Supabase mock: flat Promise-based, no circular chains
// ──────────────────────────────────────────────────────────────────
type RecipeRow = { id: string; name: string; category: string; diet: string; time_minutes: number }
type RIRow = { recipe_id: string; quantity: string; optional: boolean; ingredients: { id: string; name: string; embedding: number[] } }

function buildSupabaseMock(recipeRows: RecipeRow[], riRows: RIRow[]): SupabaseClient {
  // Thenable that resolves immediately
  const recipeResult = { data: recipeRows, error: null }
  const riResult = { data: riRows, error: null }

  // Chain that ignores all filter calls and returns the fixed result — generic to handle any data type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeFilterChain = (result: { data: any; error: null }) => {
    const chain: Record<string, unknown> = {}
    chain.select = jest.fn().mockReturnValue(chain)
    chain.eq = jest.fn().mockReturnValue(chain)
    chain.lte = jest.fn().mockReturnValue(chain)
    chain.in = jest.fn().mockReturnValue(chain)
    chain.order = jest.fn().mockReturnValue(chain)
    // Make it thenable (await-able)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.then = jest.fn().mockImplementation(
      (resolve: (v: typeof result) => void, _reject?: unknown) => Promise.resolve(resolve(result))
    )
    chain.catch = jest.fn().mockReturnValue(chain)
    return chain
  }

  return {
    from: jest.fn().mockImplementation((table: string) => {
      if (table === 'recipes') return makeFilterChain(recipeResult)
      if (table === 'recipe_ingredients') return makeFilterChain(riResult)
      return makeFilterChain({ data: [], error: null })
    }),
  } as unknown as SupabaseClient
}

// ──────────────────────────────────────────────────────────────────
// Mock embedder
// ──────────────────────────────────────────────────────────────────
function buildMockEmbedder(returnVec: number[]): EmbeddingProvider {
  return {
    embedText: jest.fn().mockResolvedValue(returnVec),
  }
}

// ──────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────
describe('matchEngine — matchRecipes()', () => {

  // ── Test 1: Time-only query ─────────────────────────────────────
  it('time-only: returns recipes under the time limit with all ingredients unconfirmed', async () => {
    const supabase = buildSupabaseMock(
      [RECIPE_DRINK_5MIN, RECIPE_DRINK_10MIN],
      [...RI_DRINK1, ...RI_DRINK2]
    )

    const input: MatchInput = { time: 10, category: null, ingredients: null, diet: null, servings: 2 }
    const results = await matchRecipes(input, supabase)

    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(5)

    // All ingredients should be unconfirmed
    for (const r of results) {
      const confirmed = r.allIngredients?.filter((i) => !i.unconfirmed) ?? []
      expect(confirmed.length).toBe(0)
    }

    // All results within time + buffer
    for (const r of results) {
      expect(r.timeMinutes).toBeLessThanOrEqual(15)
    }
  })

  // ── Test 2: Ingredients-only query ──────────────────────────────
  it('ingredients-only: no time filter, matches via embedding, embedder called once', async () => {
    // Use a LOW similarity threshold scenario: all ingredients map to the SAME seed (1)
    // so ING_ICE (seed 1) matches perfectly; the rest score 0.
    // DRINK_2 has 4 required ingredients and ING_ICE is one of them → 1/4 = 25% match,
    // missing 3, so it gets dropped (>2 missing). 
    // DRINK_1 has 5 required ingredients and ING_ICE is one of them → 1/5 = 20%, missing 4, dropped.
    // MEAL has 2 required ingredients; ING_WATER (seed 5) scores 0, ING_LENTILS (seed 8) scores 0 → dropped.
    //
    // To get a POSITIVE match we make ALL required ingredients of DRINK_1 use the same embedding (seed 3):
    // We replace the fixture ingredients with ones that all share seed 3.
    
    const ING_ICE_SAME = { id: 'i-1', name: 'ice cubes', embedding: fakeEmbedding(3) }
    const ING_LEMON_SAME = { id: 'i-2', name: 'lemon juice', embedding: fakeEmbedding(3) }
    const ING_TANG_SAME = { id: 'i-3', name: 'tang orange powder', embedding: fakeEmbedding(3) }
    const ING_MINT_SAME = { id: 'i-4', name: 'mint leaves', embedding: fakeEmbedding(3) }
    const ING_WATER_SAME = { id: 'i-5', name: 'cold water', embedding: fakeEmbedding(3) }

    const ri_drink1_all_same = [
      { recipe_id: 'r-drink-1', quantity: '3 tbsp', optional: false, ingredients: ING_TANG_SAME },
      { recipe_id: 'r-drink-1', quantity: '1 cup',  optional: false, ingredients: ING_ICE_SAME },
      { recipe_id: 'r-drink-1', quantity: '10 leaves', optional: false, ingredients: ING_MINT_SAME },
      { recipe_id: 'r-drink-1', quantity: '300 ml', optional: false, ingredients: ING_WATER_SAME },
      { recipe_id: 'r-drink-1', quantity: '1 tbsp', optional: false, ingredients: ING_LEMON_SAME },
    ]

    const supabase = buildSupabaseMock(
      [RECIPE_DRINK_5MIN, RECIPE_DRINK_10MIN, RECIPE_MEAL_30MIN],
      [...ri_drink1_all_same, ...RI_DRINK2, ...RI_MEAL]
    )

    // Query embedding = seed 3 → all ingredients of DRINK_1 score 1.0 (≥0.78)
    const embedder = buildMockEmbedder(fakeEmbedding(3))

    const input: MatchInput = {
      time: null,
      category: null,
      ingredients: ['ice', 'lemon juice', 'tang', 'mint leaves'],
      diet: null,
      servings: 2,
    }

    const results = await matchRecipes(input, supabase, embedder)

    // Embedder called exactly once
    expect((embedder.embedText as jest.Mock).mock.calls.length).toBe(1)
    expect(results.length).toBeGreaterThan(0)

    // DRINK_1 all ingredients match seed 3 → perfect score, must appear
    const drinkMatch = results.find((r) => r.id === 'r-drink-1')
    expect(drinkMatch).toBeDefined()
    expect(drinkMatch!.matchScore).toBeCloseTo(1.0, 1)
  })

  // ── Test 3: Both time and ingredients ───────────────────────────
  it('both: time-filtered candidates then scored by ingredient match', async () => {
    // All required ingredients of DRINK_2 share the same embedding (seed 2) → all match query
    const ING_LEMON2 = { id: 'i-2', name: 'lemon juice', embedding: fakeEmbedding(2) }
    const ING_MINT2  = { id: 'i-4', name: 'mint leaves', embedding: fakeEmbedding(2) }
    const ING_ICE2   = { id: 'i-1', name: 'ice cubes', embedding: fakeEmbedding(2) }
    const ING_WATER2 = { id: 'i-5', name: 'cold water', embedding: fakeEmbedding(2) }

    const ri_drink2_all_same = [
      { recipe_id: 'r-drink-2', quantity: '4 whole',   optional: false, ingredients: ING_LEMON2 },
      { recipe_id: 'r-drink-2', quantity: '20 leaves',  optional: false, ingredients: ING_MINT2 },
      { recipe_id: 'r-drink-2', quantity: '2 cups',     optional: false, ingredients: ING_ICE2 },
      { recipe_id: 'r-drink-2', quantity: '500 ml',     optional: false, ingredients: ING_WATER2 },
    ]

    const supabase = buildSupabaseMock(
      [RECIPE_DRINK_5MIN, RECIPE_DRINK_10MIN],
      [...RI_DRINK1, ...ri_drink2_all_same]
    )

    const embedder = buildMockEmbedder(fakeEmbedding(2)) // matches seed 2

    const input: MatchInput = {
      time: 10,
      category: 'drink',
      ingredients: ['ice', 'lemon', 'mint'],
      diet: null,
      servings: 2,
    }

    const results = await matchRecipes(input, supabase, embedder)

    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(r.category).toBe('drink')
      expect(r.timeMinutes).toBeLessThanOrEqual(15)
    }

    // DRINK_2 should have a high match score (all 4 required ingredients match seed 2)
    const drink2 = results.find((r) => r.id === 'r-drink-2')
    expect(drink2).toBeDefined()
    expect(drink2!.matchScore).toBeCloseTo(1.0, 1)

    // Embedder called once
    expect((embedder.embedText as jest.Mock).mock.calls.length).toBe(1)
  })

  // ── Test 4: Diet exclusion ───────────────────────────────────────
  it('diet exclusion: SQL returns only vegan recipes; result has no non-veg entries', async () => {
    // Simulate Supabase already filtering out non-veg (returns only vegan rows)
    const veganOnly = [RECIPE_DRINK_5MIN, RECIPE_DRINK_10MIN, RECIPE_MEAL_30MIN]
    const supabase = buildSupabaseMock(veganOnly, [...RI_DRINK1, ...RI_DRINK2, ...RI_MEAL])

    const input: MatchInput = { time: null, category: null, ingredients: null, diet: 'vegan', servings: 2 }
    const results = await matchRecipes(input, supabase)

    // Non-veg recipe 'r-nonveg-1' never appears
    const nonVeg = results.find((r) => r.id === 'r-nonveg-1')
    expect(nonVeg).toBeUndefined()

    for (const r of results) {
      expect(r.diet).toBe('vegan')
    }
  })
})
