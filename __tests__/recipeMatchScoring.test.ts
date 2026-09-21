import { matchRecipes } from '../lib/matchEngine'
import { SupabaseClient } from '@supabase/supabase-js'

function database(recipes: any[], recipeIngredients: any[]): SupabaseClient {
  const chain = (result: any) => {
    const value: any = { select: jest.fn(), eq: jest.fn(), lte: jest.fn(), in: jest.fn() }
    Object.values(value).forEach((fn: any) => fn.mockReturnValue(value))
    value.then = (resolve: any) => Promise.resolve(resolve({ data: result, error: null }))
    return value
  }
  return { from: jest.fn((table: string) => chain(table === 'recipes' ? recipes : recipeIngredients)) } as unknown as SupabaseClient
}

describe('single recipe-match engine regression coverage', () => {
  const recipes = [{ id: 'karn-neer-dosa', name: 'Neer Dosa', category: 'meal', diet: 'vegan', time_minutes: 15 }]
  const ingredients = [
    { recipe_id: 'karn-neer-dosa', quantity: '1 cup', optional: false, ingredients: { name: 'Raw Rice' } },
    { recipe_id: 'karn-neer-dosa', quantity: '1 cup', optional: false, ingredients: { name: 'Fresh Grated Coconut' } },
    { recipe_id: 'karn-neer-dosa', quantity: 'to taste', optional: false, ingredients: { name: 'Salt' } },
    { recipe_id: 'karn-neer-dosa', quantity: '1 tsp', optional: false, ingredients: { name: 'Oil for drizzling' } },
  ]

  test.each([
    ['zero ingredients', [], 0, 0, 1],
    ['partial ingredients', ['raw rice'], 1, 2, 0.75],
    ['Neer Dosa complete', ['raw rice', 'fresh grated coconut'], 2, 2, 1],
  ])('%s is scored once and reports staple provenance', async (_state, pantry, fromPantry, fromStaples, score) => {
    const [result] = await matchRecipes(
      { time: null, category: null, ingredients: pantry as string[], diet: null, servings: 2 },
      database(recipes, ingredients)
    )
    expect(result.matchScore).toBe(score)
    expect(result.matchedFromPantry).toBe(fromPantry)
    expect(result.matchedFromStaples).toBe(fromStaples)
    expect(result.requiredIngredientCount).toBe(4)
  })
})
