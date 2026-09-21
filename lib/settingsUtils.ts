// ─── Settings Types & Pure Utilities (Server & Client Safe) ───────────────────

export type DietType = 'all' | 'veg' | 'non-veg' | 'vegan' | 'jain'

export interface AllergyOption {
  id: string
  label: string
  icon?: string
  keywords: string[]
}

export const ALLERGY_OPTIONS: AllergyOption[] = [
  { id: 'peanuts',   label: 'Peanuts',    keywords: ['peanut', 'peanuts', 'groundnut', 'groundnuts'] },
  { id: 'gluten',    label: 'Gluten',     keywords: ['wheat', 'flour', 'maida', 'atta', 'gluten', 'semolina', 'sooji', 'bread', 'pasta'] },
  { id: 'dairy',     label: 'Dairy',      keywords: ['milk', 'cheese', 'paneer', 'butter', 'ghee', 'curd', 'yogurt', 'cream', 'malai'] },
  { id: 'soy',       label: 'Soy',        keywords: ['soy', 'soya', 'tofu', 'edamame', 'soy sauce'] },
  { id: 'shellfish', label: 'Shellfish',  keywords: ['shrimp', 'prawn', 'crab', 'lobster', 'shellfish'] },
  { id: 'treenuts',  label: 'Tree Nuts',  keywords: ['almond', 'badam', 'cashew', 'kaju', 'walnut', 'pistachio', 'pista'] },
]

export type RegionType =
  | 'all'
  | 'All'
  | 'Kerala'
  | 'Tamil Nadu'
  | 'Maharashtra'
  | 'Karnataka'
  | 'North Indian'
  | 'South Indian'
  | 'East Indian'
  | 'West Indian'

export const REGION_OPTIONS: { id: RegionType; label: string; desc: string; icon?: string }[] = [
  { id: 'all',          label: 'Pan-Indian / Any', desc: 'All regional culinary traditions', icon: '🇮🇳' },
  { id: 'Kerala',       label: 'Kerala',           desc: 'Coconut, curry leaves, roasted spices & seafood', icon: '🌴' },
  { id: 'Tamil Nadu',   label: 'Tamil Nadu',       desc: 'Tamarind, mustard tadka, sevai & rasam', icon: '🛕' },
  { id: 'Maharashtra',  label: 'Maharashtra',      desc: 'Poha, misal, goda masala & farsan', icon: '🌊' },
  { id: 'Karnataka',    label: 'Karnataka',        desc: 'Bisi bele bath, neer dosa & curd rice', icon: '🌾' },
  { id: 'North Indian', label: 'North Indian',     desc: 'Rich curries, rotis, paneer & butter', icon: '🍲' },
]

export const DEFAULT_PANTRY_STAPLES = [
  'Salt',
  'Cooking Oil',
  'Turmeric (Haldi)',
  'Cumin Seeds (Jeera)',
  'Mustard Seeds',
  'Red Chili Powder',
  'Black Pepper',
  'Ghee',
  'Sugar',
  'Coriander Powder',
]

export type ThemeMode = 'light' | 'dark'
export type UnitType = 'metric' | 'imperial'

export interface UserSettings {
  theme: ThemeMode
  diet: DietType
  allergies: string[]
  region: RegionType
  servings: number
  pantryStaples: string[]
  units: UnitType
  account: {
    email: string | null
    name: string
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  diet: 'all',
  allergies: [],
  region: 'all',
  servings: 2,
  pantryStaples: DEFAULT_PANTRY_STAPLES,
  units: 'metric',
  account: {
    email: null,
    name: 'Home Chef',
  },
}

// ─── Filter & Match Checkers ──────────────────────────────────────────────────
/**
 * Check if an ingredient violates any of the user's active allergies
 */
export function ingredientViolatesAllergies(ingredientName: string, activeAllergyIds: string[]): boolean {
  if (!activeAllergyIds || activeAllergyIds.length === 0) return false
  const lowerName = ingredientName.toLowerCase()

  for (const allergyId of activeAllergyIds) {
    const option = ALLERGY_OPTIONS.find((a) => a.id === allergyId)
    if (option) {
      for (const kw of option.keywords) {
        if (lowerName.includes(kw)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Check if an ingredient matches user's standing pantry staples
 */
export function isPantryStaple(ingredientName: string, staples: string[]): boolean {
  if (!staples || staples.length === 0) return false
  const lower = ingredientName.toLowerCase().trim()

  return staples.some((staple) => {
    // Extract base name, e.g. "Turmeric (Haldi)" -> ["turmeric", "haldi"]
    const cleanedStaple = staple.toLowerCase()
    const parts = cleanedStaple.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean)
    return parts.some((p) => lower.includes(p) || p.includes(lower))
  })
}

/**
 * Maps GPS latitude and longitude coordinates to the most relevant Indian culinary region.
 */
export function detectRegionFromCoords(latitude: number, longitude: number): RegionType {
  // Kerala: approx Lat 8.2 - 12.8, Long 74.8 - 77.5
  if (latitude >= 8.2 && latitude <= 12.8 && longitude >= 74.8 && longitude <= 77.5) {
    return 'Kerala'
  }
  // Tamil Nadu: approx Lat 8.1 - 13.5, Long 76.2 - 80.3
  if (latitude >= 8.1 && latitude <= 13.5 && longitude >= 76.2 && longitude <= 80.3) {
    return 'Tamil Nadu'
  }
  // Maharashtra: approx Lat 15.6 - 22.0, Long 72.6 - 80.9
  if (latitude >= 15.6 && latitude <= 22.0 && longitude >= 72.6 && longitude <= 80.9) {
    return 'Maharashtra'
  }
  // Karnataka: approx Lat 11.5 - 18.5, Long 74.0 - 78.6
  if (latitude >= 11.5 && latitude <= 18.5 && longitude >= 74.0 && longitude <= 78.6) {
    return 'Karnataka'
  }
  // North India: Lat > 22.0
  if (latitude > 22.0) {
    return 'North Indian'
  }
  return 'Kerala'
}
