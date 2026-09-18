'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Saved Recipes Data Types ──────────────────────────────────────────────────
export interface RecipeStep {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number | null
  parallel: boolean
}

export interface SavedRecipe {
  id: string
  name: string
  image: string
  time: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  calories: number
  category: SavedCategory
  diet: 'veg' | 'non-veg' | 'vegan' | 'jain'
  ingredients?: Array<{ name: string; quantity: string; optional?: boolean }>
  steps?: RecipeStep[]
  servings?: number
  savedAt?: string
}

export type SavedCategory = 'All' | 'Vegan' | 'Protein' | 'Snacks' | 'Desserts' | 'Breakfast' | 'Drinks'

// ─── Seed Starter Data (shown only if storage is empty) ────────────────────────
export const SEED_SAVED_RECIPES: SavedRecipe[] = [
  {
    id: 'bowl-001',
    name: 'Quinoa Veggie Bowl',
    image: '/food/salad.jpg',
    time: 45,
    difficulty: 'Easy',
    calories: 750,
    category: 'Vegan',
    diet: 'vegan',
    servings: 2,
    ingredients: [
      { name: 'Quinoa', quantity: '1 cup' },
      { name: 'Avocado', quantity: '1 medium' },
      { name: 'Cherry Tomatoes', quantity: '1/2 cup' },
      { name: 'Cucumber', quantity: '1/2 diced' },
      { name: 'Baby Spinach', quantity: '2 cups' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Rinse quinoa and cook in 2 cups water for 15 minutes.', duration_minutes: 15, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Chop avocado, tomatoes, and cucumber into bite-sized pieces.', duration_minutes: 5, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Toss cooked quinoa with baby spinach, vegetables, olive oil, and lemon juice.', duration_minutes: 5, parallel: false },
    ],
  },
  {
    id: 'pasta-001',
    name: 'Spicy Tomato Fusilli',
    image: '/food/pasta.jpg',
    time: 20,
    difficulty: 'Easy',
    calories: 520,
    category: 'Protein',
    diet: 'veg',
    servings: 2,
    ingredients: [
      { name: 'Fusilli Pasta', quantity: '200g' },
      { name: 'Cherry Tomatoes', quantity: '1 cup' },
      { name: 'Garlic', quantity: '3 cloves' },
      { name: 'Olive Oil', quantity: '2 tbsp' },
      { name: 'Chili Flakes', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Boil fusilli in salted water until al dente (about 10 mins).', duration_minutes: 10, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Sauté minced garlic and chili flakes in olive oil until fragrant.', duration_minutes: 3, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add burst cherry tomatoes and toss pasta through the sauce.', duration_minutes: 5, parallel: false },
    ],
  },
  {
    id: 'salmon-001',
    name: 'Salmon Rice Bowl',
    image: '/food/bowl.jpg',
    time: 25,
    difficulty: 'Medium',
    calories: 640,
    category: 'Protein',
    diet: 'non-veg',
    servings: 2,
    ingredients: [
      { name: 'Salmon Fillet', quantity: '250g' },
      { name: 'Cooked Rice', quantity: '2 cups' },
      { name: 'Soy Sauce', quantity: '2 tbsp' },
      { name: 'Sesame Oil', quantity: '1 tsp' },
      { name: 'Cucumber', quantity: '1/2 sliced' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Season salmon with soy sauce and sear in pan for 4 mins each side.', duration_minutes: 8, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Flake salmon gently over warm steamed rice and garnish with cucumber.', duration_minutes: 3, parallel: false },
    ],
  },
  {
    id: 'yogurt-001',
    name: 'Berry Yogurt Parfait',
    image: '/food/yogurt.jpg',
    time: 5,
    difficulty: 'Easy',
    calories: 320,
    category: 'Breakfast',
    diet: 'veg',
    servings: 1,
    ingredients: [
      { name: 'Greek Yogurt', quantity: '1 cup' },
      { name: 'Mixed Berries', quantity: '1/2 cup' },
      { name: 'Honey', quantity: '1 tbsp' },
      { name: 'Granola', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Layer Greek yogurt in a glass with mixed berries and granola.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Drizzle with golden honey and enjoy fresh.', duration_minutes: 2, parallel: false },
    ],
  },
]

const STORAGE_KEY = 'mise_saved_recipes_v1'
const EVENT_NAME = 'mise_saved_recipes_changed'

function normalizeCategory(rawCat?: string, diet?: string): SavedCategory {
  const cat = (rawCat || '').toLowerCase()
  if (cat.includes('drink') || cat.includes('beverage') || cat.includes('cooler') || cat.includes('spritz') || cat.includes('tea') || cat.includes('coffee')) return 'Drinks'
  if (cat.includes('snack') || cat.includes('chaat') || cat.includes('bhel')) return 'Snacks'
  if (cat.includes('dessert') || cat.includes('sweet')) return 'Desserts'
  if (cat.includes('breakfast') || cat.includes('brunch')) return 'Breakfast'
  if (diet === 'vegan' || cat.includes('vegan') || cat.includes('salad')) return 'Vegan'
  return 'Protein'
}

function loadFromStorage(): SavedRecipe[] {
  if (typeof window === 'undefined') return SEED_SAVED_RECIPES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_SAVED_RECIPES
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_SAVED_RECIPES
  } catch {
    return SEED_SAVED_RECIPES
  }
}

function saveToStorage(list: SavedRecipe[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(EVENT_NAME))
  } catch (err) {
    console.warn('[useSavedRecipes] Failed to write to localStorage:', err)
  }
}

// ─── Unified Saved Recipes Hook ───────────────────────────────────────────────
export function useSavedRecipes() {
  const [saved, setSaved] = useState<SavedRecipe[]>(loadFromStorage)

  // Synchronize across components and tabs
  useEffect(() => {
    const refresh = () => setSaved(loadFromStorage())
    window.addEventListener(EVENT_NAME, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(EVENT_NAME, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const isSaved = useCallback(
    (id: string) => saved.some((r) => r.id === id),
    [saved]
  )

  const unsave = useCallback((id: string) => {
    setSaved((prev) => {
      const updated = prev.filter((r) => r.id !== id)
      saveToStorage(updated)
      return updated
    })
  }, [])

  const saveRecipe = useCallback(
    (recipe: {
      id: string
      name: string
      image?: string
      image_url?: string
      time_minutes?: number
      time?: number
      difficulty?: string
      calories?: number
      category?: string
      diet?: string
      ingredients?: Array<{ name: string; quantity: string; optional?: boolean }>
      steps?: RecipeStep[]
      servings?: number
    }) => {
      setSaved((prev) => {
        // If already saved, update it, otherwise prepend to the top
        const existingIdx = prev.findIndex((r) => r.id === recipe.id)
        const timeVal = Number(recipe.time_minutes || recipe.time || 15)
        const catVal = normalizeCategory(recipe.category, recipe.diet)
        const dietVal = (recipe.diet?.toLowerCase() as SavedRecipe['diet']) || 'veg'
        const diffVal = (recipe.difficulty === 'medium' || recipe.difficulty === 'Medium' ? 'Medium' : recipe.difficulty === 'hard' || recipe.difficulty === 'Hard' ? 'Hard' : 'Easy') as SavedRecipe['difficulty']
        const calVal = recipe.calories ?? (catVal === 'Drinks' ? 120 : catVal === 'Snacks' ? 280 : 450)
        const imgVal = recipe.image_url || recipe.image || (catVal === 'Drinks' ? '/food/salad.jpg' : '/food/bowl.jpg')

        const item: SavedRecipe = {
          id: recipe.id,
          name: recipe.name,
          image: imgVal,
          time: timeVal,
          difficulty: diffVal,
          calories: calVal,
          category: catVal,
          diet: dietVal,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          servings: recipe.servings ?? 2,
          savedAt: new Date().toISOString(),
        }

        let updated: SavedRecipe[]
        if (existingIdx >= 0) {
          updated = [...prev]
          updated[existingIdx] = { ...prev[existingIdx], ...item }
        } else {
          updated = [item, ...prev]
        }

        saveToStorage(updated)
        return updated
      })
    },
    []
  )

  const toggleSave = useCallback(
    (recipe: {
      id: string
      name: string
      image?: string
      image_url?: string
      time_minutes?: number
      time?: number
      difficulty?: string
      calories?: number
      category?: string
      diet?: string
      ingredients?: Array<{ name: string; quantity: string; optional?: boolean }>
      steps?: RecipeStep[]
      servings?: number
    }) => {
      if (isSaved(recipe.id)) {
        unsave(recipe.id)
      } else {
        saveRecipe(recipe)
      }
    },
    [isSaved, unsave, saveRecipe]
  )

  const getSavedRecipe = useCallback(
    (id: string): SavedRecipe | undefined => {
      return saved.find((r) => r.id === id)
    },
    [saved]
  )

  return { saved, saveRecipe, unsave, isSaved, toggleSave, getSavedRecipe }
}

// ─── Backwards Compatibility Stubs ───────────────────────────────────────────
export function useSavedMatchedResults() {
  const { saved, saveRecipe, unsave, isSaved } = useSavedRecipes()

  const saveMatchedResult = useCallback(
    (payload: {
      recipeId: string
      recipeName: string
      recipeImage: string
      timeMinutes: number
      servings: number
      ingredientSnapshot: string[]
    }) => {
      saveRecipe({
        id: payload.recipeId,
        name: payload.recipeName,
        image: payload.recipeImage,
        time_minutes: payload.timeMinutes,
        servings: payload.servings,
        ingredients: payload.ingredientSnapshot.map((name) => ({ name, quantity: 'to taste' })),
      })
    },
    [saveRecipe]
  )

  const unsaveMatchedResult = useCallback(
    (recipeId: string) => {
      unsave(recipeId)
    },
    [unsave]
  )

  const isSavedResult = useCallback(
    (recipeId: string) => {
      return isSaved(recipeId)
    },
    [isSaved]
  )

  return {
    matchedResults: saved.map((r) => ({
      key: r.id,
      recipeId: r.id,
      recipeName: r.name,
      recipeImage: r.image,
      timeMinutes: r.time,
      servings: r.servings || 2,
      ingredientSnapshot: (r.ingredients || []).map((i) => i.name),
      savedAt: r.savedAt || new Date().toISOString(),
    })),
    saveMatchedResult,
    unsaveMatchedResult,
    isSavedResult,
  }
}
