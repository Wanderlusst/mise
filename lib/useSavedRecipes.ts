'use client'

import { useState, useEffect, useCallback } from 'react'
import { REGIONAL_RECIPES } from './regionalRecipes'

// ─── Recipe Steps & Types ──────────────────────────────────────────────────────
export interface RecipeStep {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number | null
  parallel: boolean
}

export type RecipeBadge = 'Trending' | 'Most Cooked' | 'Favorite' | 'New' | 'Chef Pick'

export interface SavedRecipe {
  id: string
  name: string
  image: string
  time: number // cooking time in minutes
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  calories?: number
  category?: string
  diet: 'veg' | 'non-veg' | 'vegan' | 'jain'
  ingredients?: Array<{ name: string; quantity: string; optional?: boolean }>
  steps?: RecipeStep[]
  servings?: number
  savedAt?: string

  // ── Personal Cooking History & Kitchen Memory ──
  timesCooked?: number
  lastCooked?: string // e.g. "Yesterday", "3 days ago", "2 weeks ago"
  bestRecordTime?: string // e.g. "11 min 42 sec"
  isFavorite?: boolean
  wantToCook?: boolean
  badge?: RecipeBadge
  tags?: string[]
}

// ── Culinary Categories (Cooking-First, Non-Fitness) ──
export type SavedCategory =
  | 'All'
  | 'Favorites'
  | 'Recently Cooked'
  | 'Ready To Cook'
  | 'Want To Cook'
  | 'Top Recipes'
  | 'Healthy'
  | 'Comfort Food'
  | 'Desserts'

// ── Default Scanned Pantry Ingredients (Simulated/Scanned Kitchen Stock) ───────
export const DEFAULT_SCANNED_INGREDIENTS = [
  'Tomatoes',
  'Onions',
  'Eggs',
  'Garlic',
  'Mustard Seeds',
  'Curry Leaves',
  'Coconut Oil',
  'Green Chilies',
  'Rice',
  'Peanuts',
  'Lemon',
  'Greek Yogurt',
  'Turmeric',
  'Salt',
]

// ─── Rich Seed Starter Data ───────────────────────────────────────────────────
export const SEED_SAVED_RECIPES: SavedRecipe[] = [
  {
    id: 'pasta-001',
    name: 'Spicy Tomato Fusilli',
    image: '/food/pasta.jpg',
    time: 15,
    difficulty: 'Easy',
    calories: 520,
    diet: 'veg',
    category: 'Comfort Food',
    badge: 'Most Cooked',
    timesCooked: 24,
    lastCooked: 'Yesterday',
    bestRecordTime: '11 min 42 sec',
    isFavorite: true,
    wantToCook: true,
    tags: ['Favorites', 'Recently Cooked', 'Ready To Cook', 'Top Recipes', 'Comfort Food'],
    servings: 2,
    ingredients: [
      { name: 'Fusilli Pasta', quantity: '200g' },
      { name: 'Cherry Tomatoes', quantity: '1 cup' },
      { name: 'Garlic', quantity: '3 cloves' },
      { name: 'Olive Oil', quantity: '2 tbsp' },
      { name: 'Chili Flakes', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Boil fusilli in heavily salted water until al dente (9 mins).', duration_minutes: 9, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Gently fry sliced garlic and chili flakes in golden olive oil until fragrant.', duration_minutes: 3, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Burst sweet cherry tomatoes into the oil, toss with hot pasta and reserved water.', duration_minutes: 3, parallel: false },
    ],
  },
  {
    id: 'burger-001',
    name: 'Gourmet Brioche Smash Burger',
    image: '/food/burger.jpg',
    time: 15,
    difficulty: 'Medium',
    calories: 680,
    diet: 'non-veg',
    category: 'Comfort Food',
    badge: 'Trending',
    timesCooked: 6,
    lastCooked: '3 days ago',
    bestRecordTime: '13 min 50 sec',
    isFavorite: true,
    wantToCook: false,
    tags: ['Favorites', 'Top Recipes', 'Comfort Food', 'Recently Cooked'],
    servings: 2,
    ingredients: [
      { name: 'Angus Beef Patties', quantity: '2 x 150g' },
      { name: 'Brioche Buns', quantity: '2 toasted' },
      { name: 'Aged Cheddar', quantity: '2 slices' },
      { name: 'Caramelized Onions', quantity: '1/2 cup' },
      { name: 'Garlic Aioli', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Toast halved brioche buns on buttered cast iron skillet until golden.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Smash seasoned patties flat onto screaming hot griddle; sear 2 mins to build crust.', duration_minutes: 4, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Top with aged cheddar, drape warm caramelized onions, and assemble on glossy buns.', duration_minutes: 3, parallel: false },
    ],
  },
  {
    id: 'dessert-001',
    name: 'Molten Chocolate Lava Cake',
    image: '/food/dessert.jpg',
    time: 18,
    difficulty: 'Medium',
    calories: 460,
    diet: 'veg',
    category: 'Desserts',
    badge: 'Chef Pick',
    timesCooked: 4,
    lastCooked: 'Last weekend',
    bestRecordTime: '16 min 10 sec',
    isFavorite: true,
    wantToCook: true,
    tags: ['Desserts', 'Favorites', 'Want To Cook', 'Comfort Food'],
    servings: 2,
    ingredients: [
      { name: 'Dark Chocolate (70%)', quantity: '120g' },
      { name: 'Unsalted Butter', quantity: '60g' },
      { name: 'Eggs', quantity: '2 large' },
      { name: 'Raw Cane Sugar', quantity: '3 tbsp' },
      { name: 'Vanilla Bean Gelato', quantity: '2 scoops' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Melt bittersweet chocolate with European butter over gentle bain-marie.', duration_minutes: 4, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Whisk eggs and sugar until pale ribbon forms; fold chocolate into ramekins.', duration_minutes: 4, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Bake at 200°C for 10 minutes until edges set with a warm, flowing center.', duration_minutes: 10, parallel: false },
    ],
  },
  {
    id: 'salmon-001',
    name: 'Seared Salmon Rice Bowl',
    image: '/food/bowl.jpg',
    time: 20,
    difficulty: 'Medium',
    calories: 640,
    diet: 'non-veg',
    category: 'Healthy',
    badge: 'Trending',
    timesCooked: 11,
    lastCooked: '5 days ago',
    bestRecordTime: '17 min 15 sec',
    isFavorite: true,
    wantToCook: true,
    tags: ['Healthy', 'Top Recipes', 'Favorites', 'Recently Cooked'],
    servings: 2,
    ingredients: [
      { name: 'Fresh Salmon Fillet', quantity: '250g' },
      { name: 'Steamed Jasmine Rice', quantity: '2 cups' },
      { name: 'Tamari Soy Sauce', quantity: '2 tbsp' },
      { name: 'Sesame Oil', quantity: '1 tsp' },
      { name: 'Cucumber', quantity: '1 crisp sliced' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Brush salmon with tamari and sesame glaze; crisp skin in hot pan for 4 mins.', duration_minutes: 6, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Flake warm salmon tenderly over steaming fragrant rice.', duration_minutes: 3, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Garnish with chilled cucumber ribbons and roasted sesame seeds.', duration_minutes: 2, parallel: false },
    ],
  },
  {
    id: 'bowl-001',
    name: 'Quinoa Green Goddess Bowl',
    image: '/food/salad.jpg',
    time: 25,
    difficulty: 'Easy',
    calories: 480,
    diet: 'vegan',
    category: 'Healthy',
    badge: 'Chef Pick',
    timesCooked: 8,
    lastCooked: '2 weeks ago',
    bestRecordTime: '21 min 05 sec',
    isFavorite: false,
    wantToCook: true,
    tags: ['Healthy', 'Want To Cook'],
    servings: 2,
    ingredients: [
      { name: 'Tri-color Quinoa', quantity: '1 cup' },
      { name: 'Ripe Hass Avocado', quantity: '1 medium' },
      { name: 'Cherry Tomatoes', quantity: '1/2 cup' },
      { name: 'Cucumber', quantity: '1/2 diced' },
      { name: 'Baby Spinach', quantity: '2 cups' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Simmer rinsed quinoa in vegetable broth for 15 mins until tender and fluffy.', duration_minutes: 15, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Slice avocado into clean fans; dice baby cucumbers and sweet tomatoes.', duration_minutes: 5, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Fold through fresh spinach with Meyer lemon juice and cold-pressed olive oil.', duration_minutes: 5, parallel: false },
    ],
  },
  {
    id: 'yogurt-001',
    name: 'Wild Berry Yogurt Parfait',
    image: '/food/yogurt.jpg',
    time: 5,
    difficulty: 'Easy',
    calories: 310,
    diet: 'veg',
    category: 'Healthy',
    badge: 'Most Cooked',
    timesCooked: 32,
    lastCooked: 'This morning',
    bestRecordTime: '3 min 50 sec',
    isFavorite: true,
    wantToCook: false,
    tags: ['Favorites', 'Ready To Cook', 'Healthy', 'Recently Cooked', 'Top Recipes'],
    servings: 1,
    ingredients: [
      { name: 'Greek Yogurt', quantity: '1 cup' },
      { name: 'Mixed Berries', quantity: '1/2 cup' },
      { name: 'Honey', quantity: '1 tbsp' },
      { name: 'Granola', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Spoon velvety thick Greek yogurt into a chilled ceramic bowl.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Cascade plump wild berries and crunchy toasted granola over top.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Finish with a delicate drizzle of golden raw honeycomb.', duration_minutes: 1, parallel: false },
    ],
  },
  {
    id: 'rice-comfort-001',
    name: '10-Minute Comfort Egg Fried Rice',
    image: '/food/bowl.jpg',
    time: 10,
    difficulty: 'Easy',
    calories: 460,
    diet: 'veg',
    category: 'Comfort Food',
    badge: 'Trending',
    timesCooked: 14,
    lastCooked: 'Recently',
    bestRecordTime: '8 min 45 sec',
    isFavorite: true,
    wantToCook: true,
    tags: ['Favorites', 'Ready To Cook', 'Comfort Food', 'Top Recipes'],
    servings: 2,
    ingredients: [
      { name: 'Cooked Rice', quantity: '2 cups' },
      { name: 'Eggs', quantity: '2 large' },
      { name: 'Butter or Cooking Oil', quantity: '1 tbsp' },
      { name: 'Salt & Black Pepper', quantity: 'to taste' },
      { name: 'Soy Sauce', quantity: '1 tsp (optional)' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Melt butter or heat oil in a hot pan or wok over medium heat.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Crack in 2 eggs, swirl with a spatula for 30s until soft, glossy curds form.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Tumble in leftover cold rice, season with salt & freshly ground black pepper.', duration_minutes: 3, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Toss over high heat for 3 minutes until rice is sizzling, toasted, and fragrant. Drizzle a dash of soy sauce if desired.', duration_minutes: 3, parallel: false },
    ],
  },
  {
    id: 'egg-omelette-002',
    name: 'Fluffy 3-Egg French Omelette',
    image: '/food/egg_roast.jpg',
    time: 6,
    difficulty: 'Easy',
    calories: 340,
    diet: 'veg',
    category: 'Comfort Food',
    badge: 'Chef Pick',
    timesCooked: 9,
    lastCooked: 'Yesterday',
    isFavorite: true,
    wantToCook: true,
    tags: ['Favorites', 'Ready To Cook', 'Comfort Food'],
    servings: 1,
    ingredients: [
      { name: 'Eggs', quantity: '3 farm fresh' },
      { name: 'Butter', quantity: '1 tbsp' },
      { name: 'Sea Salt & White Pepper', quantity: 'to taste' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Whisk eggs vigorously with a fork until smooth without egg white streaks.', duration_minutes: 1, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Melt butter in non-stick pan over medium-low heat without browning.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Pour in eggs, swirl pan and gently stir with silicone spatula to create soft curds.', duration_minutes: 2, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Roll omelette onto itself, slide onto a warm plate, and brush with melted butter.', duration_minutes: 1, parallel: false },
    ],
  },
  {
    id: 'shakshuka-vision-001',
    name: 'Pan-Seared Tomato & Pepper Shakshuka',
    image: '/food/egg_roast.jpg',
    time: 15,
    difficulty: 'Easy',
    calories: 390,
    diet: 'veg',
    category: 'Comfort Food',
    badge: 'Trending',
    timesCooked: 5,
    lastCooked: 'Recently',
    isFavorite: true,
    wantToCook: true,
    tags: ['Favorites', 'Ready To Cook', 'Comfort Food'],
    servings: 2,
    ingredients: [
      { name: 'Eggs', quantity: '2 large' },
      { name: 'Tomatoes', quantity: '2 ripe chopped' },
      { name: 'Olive Oil', quantity: '1 tbsp' },
      { name: 'Cumin & Paprika', quantity: '1/2 tsp each' },
      { name: 'Salt & Pepper', quantity: 'to taste' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Sauté chopped tomatoes, cumin, and paprika in hot olive oil until a thick bubbling sauce forms.', duration_minutes: 6, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Create two small wells in the sauce and crack the eggs directly inside.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Cover with lid and simmer on low heat for 5 minutes until egg whites are set and yolks remain runny.', duration_minutes: 5, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Garnish with freshly ground black pepper and serve with crusty bread.', duration_minutes: 2, parallel: false },
    ],
  },
  ...REGIONAL_RECIPES.map((r): SavedRecipe => ({
    id: r.id,
    name: r.name,
    image: r.image,
    time: r.time,
    difficulty: r.difficulty === 'Quick' ? 'Easy' : r.difficulty === 'Feast' ? 'Hard' : 'Medium',
    diet: r.diet,
    category: r.region,
    badge: 'Trending',
    timesCooked: 8,
    lastCooked: 'Recently',
    isFavorite: true,
    wantToCook: true,
    tags: ['Favorites', 'Ready To Cook', r.region, 'Top Recipes'],
    servings: 2,
    ingredients: r.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      optional: Boolean(ing.optional),
    })),
    steps: r.steps.map((s) => ({
      id: s.id,
      step_order: s.step_order,
      instruction: s.instruction,
      duration_minutes: s.duration_minutes,
      parallel: Boolean(s.parallel),
    })),
  })),
]

const STORAGE_KEY = 'mise_saved_recipes_v2'
const OLD_STORAGE_KEY = 'mise_saved_recipes_v1'
const EVENT_NAME = 'mise_saved_recipes_changed'
const PANTRY_STORAGE_KEY = 'mise_scanned_ingredients_v1'

// ── Normalize Category ────────────────────────────────────────────────────────
function normalizeCategory(rawCat?: string, diet?: string): SavedCategory {
  const cat = (rawCat || '').toLowerCase()
  if (cat.includes('dessert') || cat.includes('sweet') || cat.includes('cake')) return 'Desserts'
  if (cat.includes('burger') || cat.includes('pasta') || cat.includes('comfort') || cat.includes('pizza')) return 'Comfort Food'
  if (cat.includes('salad') || cat.includes('bowl') || diet === 'vegan' || cat.includes('healthy')) return 'Healthy'
  return 'Favorites'
}

// ── Upgrade or migrate legacy items to rich cooking format ────────────────────
function enrichRecipe(recipe: SavedRecipe): SavedRecipe {
  const seedMatch = SEED_SAVED_RECIPES.find((s) => s.id === recipe.id)
  return {
    ...seedMatch,
    ...recipe,
    image: recipe.image || seedMatch?.image || '/food/pasta.jpg',
    time: recipe.time || seedMatch?.time || 15,
    timesCooked: recipe.timesCooked ?? seedMatch?.timesCooked ?? 3,
    lastCooked: recipe.lastCooked ?? seedMatch?.lastCooked ?? 'Recently',
    bestRecordTime: recipe.bestRecordTime ?? seedMatch?.bestRecordTime ?? '14 min 20 sec',
    badge: recipe.badge ?? seedMatch?.badge ?? 'Favorite',
    tags: recipe.tags && recipe.tags.length > 0 ? recipe.tags : seedMatch?.tags ?? ['Favorites', 'Top Recipes'],
    isFavorite: recipe.isFavorite ?? seedMatch?.isFavorite ?? true,
    wantToCook: recipe.wantToCook ?? seedMatch?.wantToCook ?? true,
    ingredients: recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : seedMatch?.ingredients,
    steps: recipe.steps && recipe.steps.length > 0 ? recipe.steps : seedMatch?.steps,
  }
}

function loadFromStorage(): SavedRecipe[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(enrichRecipe)
      }
    }

    // Check old storage key for graceful migration
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldRaw) {
      const parsedOld = JSON.parse(oldRaw)
      if (Array.isArray(parsedOld) && parsedOld.length > 0) {
        const enriched = parsedOld.map(enrichRecipe)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched))
        return enriched
      }
    }

    return []
  } catch {
    return []
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

// ─── Scanned Pantry Ingredients Hook ──────────────────────────────────────────
export function useScannedPantry() {
  const [pantry, setPantry] = useState<string[]>([])
  const [isPantryLoaded, setIsPantryLoaded] = useState(false)

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(PANTRY_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) setPantry(parsed)
        } else {
          setPantry([])
        }
      } catch {
        setPantry([])
      }
    }
    sync()
    setIsPantryLoaded(true)

    window.addEventListener('storage', sync)
    window.addEventListener('mise_pantry_changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('mise_pantry_changed', sync)
    }
  }, [])

  const setPantryItems = useCallback((items: string[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items))
      setPantry(items)
      window.dispatchEvent(new Event('mise_pantry_changed'))
      window.dispatchEvent(new Event('storage'))
    } catch {}
  }, [])

  const addPantryItems = useCallback((items: string[]) => {
    if (typeof window === 'undefined') return
    try {
      setPantry((prev) => {
        const next = Array.from(new Set([...prev, ...items]))
        localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(next))
        window.dispatchEvent(new Event('mise_pantry_changed'))
        window.dispatchEvent(new Event('storage'))
        return next
      })
    } catch {}
  }, [])

  const updatePantry = useCallback((items: string[]) => {
    setPantry(items)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items))
        window.dispatchEvent(new Event('mise_pantry_changed'))
        window.dispatchEvent(new Event('storage'))
      } catch {
        // ignore
      }
    }
  }, [])

  return { pantry, updatePantry, setPantryItems, addPantryItems }
}

// ─── Smart Cooking Insight Analyzer ───────────────────────────────────────────
export interface CookingInsight {
  haveCount: number
  totalCount: number
  missingCount: number
  missingNames: string[]
  isReadyToCook: boolean
  badgeText: string
  badgeVariant: 'ready' | 'missing-few' | 'missing-many'
  subtext: string
}

export function computeRecipeCookingInsight(recipe: SavedRecipe, pantryItems: string[]): CookingInsight {
  const ingredients = recipe.ingredients || []
  const totalCount = ingredients.length

  if (totalCount === 0) {
    return {
      haveCount: 0,
      totalCount: 0,
      missingCount: 0,
      missingNames: [],
      isReadyToCook: true,
      badgeText: 'Ready To Cook',
      badgeVariant: 'ready',
      subtext: 'Everything ready',
    }
  }

  const normalizedPantry = pantryItems.map((p) => p.toLowerCase().trim())

  const missing: string[] = []
  let haveCount = 0

  for (const ing of ingredients) {
    const nameLower = ing.name.toLowerCase().trim()
    const isMatched = normalizedPantry.some(
      (p) => nameLower.includes(p) || p.includes(nameLower) || (p.split(' ')[0] && nameLower.includes(p.split(' ')[0]))
    )
    if (isMatched) {
      haveCount++
    } else {
      missing.push(ing.name)
    }
  }

  const missingCount = missing.length
  const isReadyToCook = missingCount === 0 || (haveCount >= 3 && missingCount <= 1)

  if (missingCount === 0) {
    return {
      haveCount,
      totalCount,
      missingCount: 0,
      missingNames: [],
      isReadyToCook: true,
      badgeText: 'Ready To Cook',
      badgeVariant: 'ready',
      subtext: 'All ingredients available',
    }
  }

  if (missingCount === 1) {
    const missingName = missing[0].split(' ')[0]
    return {
      haveCount,
      totalCount,
      missingCount: 1,
      missingNames: missing,
      isReadyToCook,
      badgeText: isReadyToCook ? 'Ready To Cook' : 'Missing 1 Item',
      badgeVariant: 'missing-few',
      subtext: `Need ${missingName}`,
    }
  }

  if (missingCount === 2) {
    const name1 = missing[0].split(' ')[0]
    const name2 = missing[1].split(' ')[0]
    return {
      haveCount,
      totalCount,
      missingCount: 2,
      missingNames: missing,
      isReadyToCook: false,
      badgeText: 'Missing 2 Items',
      badgeVariant: 'missing-few',
      subtext: `Need ${name1} & ${name2}`,
    }
  }

  return {
    haveCount,
    totalCount,
    missingCount,
    missingNames: missing,
    isReadyToCook: false,
    badgeText: `Have ${haveCount}/${totalCount} Items`,
    badgeVariant: 'missing-many',
    subtext: `Need ${missingCount} ingredients`,
  }
}

// ─── Unified Saved Recipes Hook ───────────────────────────────────────────────
export function useSavedRecipes() {
  const [saved, setSaved] = useState<SavedRecipe[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Synchronize across components and tabs
  useEffect(() => {
    setSaved(loadFromStorage())
    setIsLoaded(true)

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

  const toggleFavorite = useCallback((id: string) => {
    setSaved((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
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
      timesCooked?: number
      lastCooked?: string
      bestRecordTime?: string
      badge?: RecipeBadge
      tags?: string[]
      isFavorite?: boolean
      wantToCook?: boolean
    }) => {
      setSaved((prev) => {
        const existingIdx = prev.findIndex((r) => r.id === recipe.id)
        const timeVal = Number(recipe.time_minutes || recipe.time || 15)
        const catVal = normalizeCategory(recipe.category, recipe.diet)
        const dietVal = (recipe.diet?.toLowerCase() as SavedRecipe['diet']) || 'veg'
        const imgVal = recipe.image_url || recipe.image || '/food/pasta.jpg'

        const item: SavedRecipe = {
          id: recipe.id,
          name: recipe.name,
          image: imgVal,
          time: timeVal,
          diet: dietVal,
          category: catVal,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          servings: recipe.servings ?? 2,
          savedAt: new Date().toISOString(),
          timesCooked: recipe.timesCooked ?? (existingIdx >= 0 ? prev[existingIdx].timesCooked : 0),
          lastCooked: recipe.lastCooked ?? (existingIdx >= 0 ? prev[existingIdx].lastCooked : undefined),
          bestRecordTime: recipe.bestRecordTime ?? (existingIdx >= 0 ? prev[existingIdx].bestRecordTime : undefined),
          badge: recipe.badge ?? 'New',
          tags: recipe.tags ?? ['Favorites', 'Want To Cook'],
          isFavorite: recipe.isFavorite ?? true,
          wantToCook: recipe.wantToCook ?? true,
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
    (recipe: Parameters<typeof saveRecipe>[0]) => {
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

  return {
    saved,
    isLoaded,
    saveRecipe,
    unsave,
    isSaved,
    toggleSave,
    toggleFavorite,
    getSavedRecipe,
  }
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
