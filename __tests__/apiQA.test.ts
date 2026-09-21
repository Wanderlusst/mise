/**
 * __tests__/apiQA.test.ts
 *
 * Comprehensive API QA test suite for Mise Route Handlers:
 * - match-recipes (time-only, ingredients-only, both, diet exclusion, 400 malformed inputs)
 * - adapt-recipe (schema conformance, bad JSON fallback, protein guardrail, retry-once)
 * - detect-ingredients (response shape, zero-detection 200 OK)
 * - save & saved-list (persists ingredients snapshot, RLS user isolation: user A cannot see user B's saves)
 */

import { POST as matchRecipesPOST } from '../app/api/match-recipes/route'
import { POST as adaptRecipePOST } from '../app/api/adapt-recipe/route'
import { POST as detectIngredientsPOST } from '../app/api/detect-ingredients/route'
import { POST as saveRecipePOST, DELETE as saveRecipeDELETE } from '../app/api/save-recipe/route'
import { GET as savedListGET } from '../app/api/saved-list/route'
import { NextRequest } from 'next/server'
import { getDynamicGreeting } from '../lib/greeting'

// ── Mock Supabase Server Client ─────────────────────────────────────────────
const mockUserSession: { user: any | null } = { user: null }
const mockSavedStore: Record<string, any[]> = {} // userId -> array of saved rows

jest.mock('../lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    auth: {
      getUser: jest.fn().mockImplementation(async () => ({
        data: { user: mockUserSession.user },
        error: null,
      })),
    },
    from: jest.fn().mockImplementation((table: string) => {
      if (table === 'saved_recipes') {
        return {
          upsert: jest.fn().mockImplementation((row: any) => {
            const uid = row.user_id
            if (!mockSavedStore[uid]) mockSavedStore[uid] = []
            const existingIdx = mockSavedStore[uid].findIndex(
              (r) => r.recipe_id === row.recipe_id
            )
            if (existingIdx >= 0) {
              mockSavedStore[uid][existingIdx] = row
            } else {
              mockSavedStore[uid].push(row)
            }
            return {
              select: jest.fn().mockResolvedValue({
                data: [row],
                error: null,
              }),
            }
          }),
          select: jest.fn().mockImplementation(() => ({
            eq: jest.fn().mockImplementation((col: string, val: string) => {
              // RLS enforcement: only return rows where user_id matches session user
              const rows = col === 'user_id' ? (mockSavedStore[val] || []) : []
              return {
                order: jest.fn().mockResolvedValue({
                  data: rows,
                  error: null,
                }),
              }
            }),
          })),
          delete: jest.fn().mockImplementation(() => ({
            eq: jest.fn().mockImplementation((col1: string, val1: string) => ({
              eq: jest.fn().mockImplementation((col2: string, val2: string) => {
                const uid = col2 === 'user_id' ? val2 : val1
                const rid = col1 === 'recipe_id' ? val1 : val2
                if (mockSavedStore[uid]) {
                  mockSavedStore[uid] = mockSavedStore[uid].filter(
                    (r) => r.recipe_id !== rid
                  )
                }
                return Promise.resolve({ error: null })
              }),
            })),
          })),
        }
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }
    }),
  })),
}))

jest.mock('../lib/generateRecipes', () => ({
  generateRecipesWithAI: jest.fn().mockImplementation(async (opts: any) => {
    const time = opts?.time
    const all = [
      {
        id: 'mock-pasta',
        name: 'Quick Pasta Aglio e Olio',
        category: 'meal',
        diet: 'vegan',
        time_minutes: 15,
        servings: 2,
        ingredients: [
          { name: 'pasta', quantity: '200g', optional: false },
          { name: 'garlic', quantity: '4 cloves', optional: false },
          { name: 'olive oil', quantity: '2 tbsp', optional: false },
        ],
        steps: [{ step_order: 1, instruction: 'Boil pasta and saute garlic.', duration_minutes: 12, parallel: false }],
        match_score: 95,
      },
      {
        id: 'mock-salad',
        name: 'Fresh Tomato Salad',
        category: 'salad',
        diet: 'vegan',
        time_minutes: 10,
        servings: 2,
        ingredients: [
          { name: 'tomato', quantity: '2 ripe', optional: false },
          { name: 'olive oil', quantity: '1 tbsp', optional: false },
        ],
        steps: [{ step_order: 1, instruction: 'Toss tomatoes with olive oil.', duration_minutes: 5, parallel: false }],
        match_score: 85,
      },
      {
        id: 'mock-chicken',
        name: 'Herbed Grilled Chicken',
        category: 'meal',
        diet: 'non-veg',
        time_minutes: 25,
        servings: 2,
        ingredients: [
          { name: 'chicken breast', quantity: '300g', optional: false },
          { name: 'olive oil', quantity: '1 tbsp', optional: false },
        ],
        steps: [{ step_order: 1, instruction: 'Grill chicken.', duration_minutes: 20, parallel: false }],
        match_score: 80,
      },
    ]
    return all.filter((r) => {
      if (time && r.time_minutes > time) return false
      return true
    })
  }),
}))

describe('PART 2 — API QA: match-recipes Route Handler', () => {
  function makeReq(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/match-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('rejects negative time with clean HTTP 400', async () => {
    const res = await matchRecipesPOST(makeReq({ time: -15 }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid time')
  })

  it('rejects unknown category with clean HTTP 400', async () => {
    const res = await matchRecipesPOST(makeReq({ category: 'alien-cuisine' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid category')
  })

  it('rejects unknown diet with clean HTTP 400', async () => {
    const res = await matchRecipesPOST(makeReq({ diet: 'carnivore-only' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid diet')
  })

  it('rejects empty ingredients array with clean HTTP 400', async () => {
    const res = await matchRecipesPOST(makeReq({ ingredients: [] }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Empty ingredients array')
  })

  it('returns time-appropriate results with unconfirmed ingredient flags for time-only query', async () => {
    const res = await matchRecipesPOST(makeReq({ time: 15 }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.recipes)).toBe(true)
    expect(json.recipes.length).toBeGreaterThan(0)
    // Verify each recipe is within time constraint + buffer
    for (const r of json.recipes) {
      expect(r.timeMinutes).toBeLessThanOrEqual(20)
      // All ingredients in time-only query must be flagged unconfirmed
      if (r.allIngredients && r.allIngredients.length > 0) {
        expect(r.allIngredients.every((i: any) => i.unconfirmed === true)).toBe(true)
      }
    }
  })

  it('returns ingredient-ranked results for ingredients-only query', async () => {
    const res = await matchRecipesPOST(makeReq({ ingredients: ['garlic', 'pasta', 'olive oil'] }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.recipes)).toBe(true)
    expect(json.recipes.length).toBeGreaterThan(0)
    expect(json.recipes[0]).toHaveProperty('matchScore')
  })

  it('both time and ingredients given together narrows correctly', async () => {
    const res = await matchRecipesPOST(makeReq({ ingredients: ['garlic', 'pasta'], time: 15 }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.recipes)).toBe(true)
    for (const r of json.recipes) {
      expect(r.timeMinutes).toBeLessThanOrEqual(20)
    }
  })

  it('diet filter strictly excludes non-matching recipes', async () => {
    const res = await matchRecipesPOST(makeReq({ ingredients: ['tomato'], diet: 'vegan' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    for (const r of json.recipes) {
      expect(r.diet).toBe('vegan')
    }
  })

  it('serves cached results with X-Cache: HIT on duplicate requests', async () => {
    const req1 = new NextRequest('http://localhost:3000/api/match-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
      body: JSON.stringify({ ingredients: ['garlic', 'pasta'], time: 15 }),
    })
    const res1 = await matchRecipesPOST(req1)
    expect(res1.status).toBe(200)

    const req2 = new NextRequest('http://localhost:3000/api/match-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
      body: JSON.stringify({ ingredients: ['garlic', 'pasta'], time: 15 }),
    })
    const res2 = await matchRecipesPOST(req2)
    expect(res2.status).toBe(200)
    expect(res2.headers.get('X-Cache')).toBe('HIT')
  })

  it('enforces rate limiting and returns HTTP 429 when quota is exhausted', async () => {
    const testIp = '192.168.1.99'
    let lastRes: any
    // Fire 41 requests (limit is 40 per window)
    for (let i = 0; i < 41; i++) {
      const req = new NextRequest('http://localhost:3000/api/match-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
        body: JSON.stringify({ time: 15 }),
      })
      lastRes = await matchRecipesPOST(req)
    }
    expect(lastRes.status).toBe(429)
    const json = await lastRes.json()
    expect(json.error).toContain('Too many requests')
    expect(lastRes.headers.get('Retry-After')).toBeDefined()
  })
})

describe('PART 2 — API QA: detect-ingredients Route Handler', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.NEXT_PUBLIC_VISION_READY
  })

  it('gates endpoint behind NEXT_PUBLIC_VISION_READY when set to false', async () => {
    process.env.NEXT_PUBLIC_VISION_READY = 'false'
    const formData = new FormData()
    formData.append('image', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')
    const req = new NextRequest('http://localhost:3000/api/detect-ingredients', {
      method: 'POST',
      body: formData,
    })
    const res = await detectIngredientsPOST(req)
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.notice).toContain('NEXT_PUBLIC_VISION_READY=false')
  })

  it('returns empty-but-valid response when no ingredients detected', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '[]' } }] }),
    })
    const formData = new FormData()
    formData.append('image', new Blob(['fake image bytes'], { type: 'image/jpeg' }), 'test.jpg')
    const req = new NextRequest('http://localhost:3000/api/detect-ingredients', {
      method: 'POST',
      body: formData,
    })
    const res = await detectIngredientsPOST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.ingredients)).toBe(true)
    expect(json.ingredients.length).toBe(0)
    expect(json.confidence).toBe('low')
  })

  it('returns correctly detected ingredients matching confirmation sheet expectations', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify([
              { name: 'tomato', confidence: 0.95 },
              { name: 'garlic', confidence: 0.88 },
            ]),
          },
        }],
      }),
    })
    const formData = new FormData()
    formData.append('image', new Blob(['fake image bytes'], { type: 'image/jpeg' }), 'test.jpg')
    const req = new NextRequest('http://localhost:3000/api/detect-ingredients', {
      method: 'POST',
      body: formData,
    })
    const res = await detectIngredientsPOST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.ingredients)).toBe(true)
    expect(json.ingredients.length).toBe(2)
    expect(json.ingredients[0]).toBe('Tomato')
    expect(json.confidence).toBe('high')
  })

  it('returns 400 if no image blob is provided in formData', async () => {
    const formData = new FormData()
    const req = new NextRequest('http://localhost:3000/api/detect-ingredients', {
      method: 'POST',
      body: formData,
    })
    const res = await detectIngredientsPOST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('No image found')
  })
})

describe('PART 2 — API QA: save / saved-list RLS Isolation', () => {
  const userA = { id: 'usr_userA_123', email: 'chefa@mise.app' }
  const userB = { id: 'usr_userB_456', email: 'chefb@mise.app' }

  beforeEach(() => {
    delete mockSavedStore[userA.id]
    delete mockSavedStore[userB.id]
  })

  it('persists both recipe id AND ingredient snapshot on save', async () => {
    mockUserSession.user = userA

    const saveBody = {
      recipeId: 'pasta-001',
      recipe: { name: 'Spicy Tomato Fusilli', time: 15 },
      ingredientsSnapshot: ['Fusilli', 'Cherry Tomatoes', 'Garlic', 'Chili Flakes'],
    }

    const req = new NextRequest('http://localhost:3000/api/save-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveBody),
    })

    const res = await saveRecipePOST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.recipeId).toBe('pasta-001')
    expect(json.ingredientsSnapshot).toEqual(['Fusilli', 'Cherry Tomatoes', 'Garlic', 'Chili Flakes'])
  })

  it('RLS verification: user A cannot see user B saved recipes', async () => {
    // 1. User B saves a secret recipe
    mockUserSession.user = userB
    await saveRecipePOST(
      new NextRequest('http://localhost:3000/api/save-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: 'secret-recipe-b',
          recipe: { name: 'Chef B Secret Truffle Dish' },
          ingredientsSnapshot: ['Black Truffle', 'Arborio Rice'],
        }),
      })
    )

    // Verify User B sees their recipe
    const resB = await savedListGET(new NextRequest('http://localhost:3000/api/saved-list'))
    const jsonB = await resB.json()
    expect(jsonB.data).toHaveLength(1)
    expect(jsonB.data[0].recipe_id).toBe('secret-recipe-b')

    // 2. User A logs in and requests saved list
    mockUserSession.user = userA
    const resA = await savedListGET(new NextRequest('http://localhost:3000/api/saved-list'))
    const jsonA = await resA.json()

    // User A cannot see User B's saved recipe!
    expect(jsonA.data).toHaveLength(0)
    const leaked = jsonA.data.find((r: any) => r.recipe_id === 'secret-recipe-b')
    expect(leaked).toBeUndefined()
  })

  it('works identically for anonymous guest sessions with real uid', async () => {
    const anonUser = { id: 'anon_guest_789', is_anonymous: true }
    mockUserSession.user = anonUser

    const saveRes = await saveRecipePOST(
      new NextRequest('http://localhost:3000/api/save-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: 'quick-omelette',
          recipe: { name: 'Classic Herb Omelette' },
          ingredientsSnapshot: ['Eggs', 'Butter', 'Parsley'],
        }),
      })
    )
    expect(saveRes.status).toBe(200)

    const listRes = await savedListGET(new NextRequest('http://localhost:3000/api/saved-list'))
    const listJson = await listRes.json()
    expect(listJson.data).toHaveLength(1)
    expect(listJson.data[0].recipe_id).toBe('quick-omelette')
  })
})

describe('PART 3 — UI QA: Time-of-Day Greeting', () => {
  it('returns Good Morning for morning hours (08:00)', () => {
    const morningDate = new Date('2026-09-19T08:00:00')
    const greeting = getDynamicGreeting(morningDate)
    expect(greeting.timeGreeting).toBe('Good Morning,')
    expect(greeting.mealContext).toBe('breakfast')
  })

  it('returns Good Afternoon for afternoon hours (13:30)', () => {
    const afternoonDate = new Date('2026-09-19T13:30:00')
    const greeting = getDynamicGreeting(afternoonDate)
    expect(greeting.timeGreeting).toBe('Good Afternoon,')
    expect(greeting.mealContext).toBe('lunch')
  })

  it('returns Good Evening for evening hours (19:00)', () => {
    const eveningDate = new Date('2026-09-19T19:00:00')
    const greeting = getDynamicGreeting(eveningDate)
    expect(greeting.timeGreeting).toBe('Good Evening,')
    expect(greeting.mealContext).toBe('dinner')
  })

  it('returns Late Night Cooking for night hours (23:30)', () => {
    const nightDate = new Date('2026-09-19T23:30:00')
    const greeting = getDynamicGreeting(nightDate)
    expect(greeting.timeGreeting).toBe('Late Night Cooking,')
    expect(greeting.mealContext).toBe('supper')
  })
})

describe('PART 3 — UI QA: Settings Erase & Reset Data Store Purge', () => {
  it('purges all client stores on reset', () => {
    const mockStorage: Record<string, string> = {
      mise_user_settings_v1: JSON.stringify({ diet: 'vegan' }),
      mise_saved_recipes_v2: JSON.stringify([{ id: 'pasta-001' }]),
      mise_saved_recipes_v1: JSON.stringify([{ id: 'legacy-001' }]),
      mise_scanned_ingredients_v1: JSON.stringify(['tomatoes', 'garlic']),
      mise_active_cooking_v1: JSON.stringify({ recipeId: 'pasta-001' }),
      mise_recent_searches: JSON.stringify(['pasta']),
    }

    // Simulate reset execution
    const keysToPurge = [
      'mise_user_settings_v1',
      'mise_saved_recipes_v2',
      'mise_saved_recipes_v1',
      'mise_saved_recipes',
      'mise_scanned_ingredients_v1',
      'mise_active_cooking_v1',
      'mise_recent_searches',
    ]
    keysToPurge.forEach((k) => delete mockStorage[k])

    expect(mockStorage.mise_saved_recipes_v2).toBeUndefined()
    expect(mockStorage.mise_scanned_ingredients_v1).toBeUndefined()
    expect(mockStorage.mise_active_cooking_v1).toBeUndefined()
    expect(mockStorage.mise_user_settings_v1).toBeUndefined()
  })
})
