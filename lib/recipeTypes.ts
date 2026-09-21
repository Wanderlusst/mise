export type IndianRegion = 'All' | 'Kerala' | 'Tamil Nadu' | 'Maharashtra' | 'Karnataka' | 'North Indian'

export interface RecipeMatchView {
  id: string
  name: string
  category: string
  timeMinutes: number
  diet: string
  region?: string | null
  imageUrl?: string | null
  regionalName?: string | null
  subtitle?: string | null
  matchScore: number
  matchedFromPantry: number
  matchedFromStaples: number
  requiredIngredientCount: number
  missingIngredients: string[]
  allIngredients?: Array<{ name: string; quantity: string; optional: boolean }>
}

export interface RegionalAIRecipe {
  id: string
  name: string
  regionalName: string
  region: 'Kerala' | 'Tamil Nadu' | 'Maharashtra' | 'Karnataka' | 'North Indian' | 'Pan-Indian'
  timeTier: '5m' | '15m' | '30m' | 'weekend'
  time: number
  image: string
  subtitle: string
  diet: 'veg' | 'non-veg' | 'vegan' | 'jain'
  difficulty: 'Quick' | 'Easy' | 'Medium' | 'Feast'
  ingredients: Array<{ name: string; quantity: string; optional?: boolean }>
  steps: Array<{ id: string; step_order: number; instruction: string; duration_minutes: number; parallel?: boolean }>
  moods: string[]
}
