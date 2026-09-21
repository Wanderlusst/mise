export type CookingMood = 'exhausted' | 'normal' | 'treat' | 'healthy' | 'spicy' | 'budget'

export type CookingTimeFilter = '5m' | '10m' | '30m' | '1h' | 'custom'

export interface MoodOption {
  id: CookingMood
  label: string
  icon: 'moon' | 'smile' | 'crown' | 'leaf' | 'flame' | 'coins'
  description: string
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'exhausted', label: 'Exhausted', icon: 'moon', description: 'Zero effort, minimal cleanup' },
  { id: 'normal', label: 'Normal', icon: 'smile', description: 'Everyday delicious meals' },
  { id: 'treat', label: 'Treat Me', icon: 'crown', description: 'Indulgent culinary reward' },
  { id: 'healthy', label: 'Healthy', icon: 'leaf', description: 'Fresh, vibrant, nutrient-dense' },
  { id: 'spicy', label: 'Spicy', icon: 'flame', description: 'Bold heat & fragrant aromatics' },
  { id: 'budget', label: 'Budget', icon: 'coins', description: 'Clever pantry staples' },
]

export interface TimeOption {
  id: CookingTimeFilter
  label: string
  icon: 'zap' | 'timer' | 'cooking-pot' | 'soup' | 'sliders'
  sublabel: string
  maxMinutes?: number
  minMinutes?: number
}

export const TIME_OPTIONS: TimeOption[] = [
  { id: '5m', label: '5 min', icon: 'zap', sublabel: 'Express', maxMinutes: 5 },
  { id: '10m', label: '10 min', icon: 'timer', sublabel: 'Quick bite', maxMinutes: 10 },
  { id: '30m', label: '30 min', icon: 'cooking-pot', sublabel: 'Weeknight', maxMinutes: 30 },
  { id: '1h', label: '1 hour+', icon: 'soup', sublabel: 'Slow simmer', minMinutes: 45 },
  { id: 'custom', label: 'Custom', icon: 'sliders', sublabel: 'Pick time' },
]

export interface ReadyToCookRecipe {
  id: string
  name: string
  subtitle?: string
  image: string
  time: number // in minutes
  ingredientCount: number
  timesCooked: number
  confidenceMatch: number // e.g. 100 or 95
  matchLabel: string
  diet: 'veg' | 'non-veg' | 'vegan' | 'jain'
  difficulty: 'Easy' | 'Medium' | 'Quick'
  rating: number
  moods?: CookingMood[]
}

export interface RecentlyCookedRecipe {
  id: string
  name: string
  image: string
  lastCookedDate: string
  timesCooked: number
  time: number
  ingredientCount: number
}

export interface ChefsPickRecipe {
  id: string
  name: string
  tagline: string
  description: string
  image: string
  time: number
  ingredientCount: number
  match: number
  reason: string
  mealType: string
}

export interface GamificationStreak {
  streakDays: number
  recipesCompleted: number
  favoritesSaved: number
}

// ── 1. READY TO COOK RECIPES ─────────────────────────────────────────
// Comprehensive rich recipe catalogue matching all time filters and moods
export const READY_TO_COOK_RECIPES: ReadyToCookRecipe[] = [
  // 5 MIN RECIPES
  {
    id: 'yogurt-001',
    name: 'Wild Berry Honey Parfait',
    subtitle: 'Velvety Greek yogurt, honey drizzle & crisp granola',
    image: '/food/yogurt.jpg',
    time: 5,
    ingredientCount: 4,
    timesCooked: 32,
    confidenceMatch: 100,
    matchLabel: '100% Match • Ready in 5m',
    diet: 'veg',
    difficulty: 'Quick',
    rating: 4.9,
    moods: ['exhausted', 'healthy', 'treat', 'budget'],
  },
  {
    id: 'toast-001',
    name: 'Garlic Butter Herb Toast',
    subtitle: 'Crusty sourdough toasted golden with garlic & sea salt',
    image: '/food/pasta.jpg',
    time: 5,
    ingredientCount: 3,
    timesCooked: 15,
    confidenceMatch: 100,
    matchLabel: '100% Match • Zero prep',
    diet: 'veg',
    difficulty: 'Quick',
    rating: 4.8,
    moods: ['exhausted', 'budget', 'normal'],
  },
  // 10 MIN RECIPES
  {
    id: 'yogurt-002',
    name: 'Classic Herb & Chive Omelette',
    subtitle: 'Fluffy farm eggs folded with garden herbs & pecorino',
    image: '/food/yogurt.jpg',
    time: 8,
    ingredientCount: 3,
    timesCooked: 8,
    confidenceMatch: 100,
    matchLabel: '100% Match • Ready in 8 mins',
    diet: 'veg',
    difficulty: 'Quick',
    rating: 4.8,
    moods: ['exhausted', 'healthy', 'budget', 'normal'],
  },
  {
    id: 'bowl-001',
    name: 'Mediterranean Veggie Bowl',
    subtitle: 'Crisp greens, avocado, cherry tomatoes & herb dressing',
    image: '/food/salad.jpg',
    time: 10,
    ingredientCount: 5,
    timesCooked: 4,
    confidenceMatch: 100,
    matchLabel: '100% Match • All ingredients ready',
    diet: 'vegan',
    difficulty: 'Quick',
    rating: 4.8,
    moods: ['healthy', 'normal', 'budget'],
  },
  {
    id: 'noodle-001',
    name: 'Chili Crisp Garlic Noodles',
    subtitle: 'Sizzling chili crisp, garlic oil & scallions over springy noodles',
    image: '/food/pasta.jpg',
    time: 10,
    ingredientCount: 4,
    timesCooked: 19,
    confidenceMatch: 95,
    matchLabel: '95% Match • Quick comfort',
    diet: 'vegan',
    difficulty: 'Quick',
    rating: 4.9,
    moods: ['spicy', 'exhausted', 'budget', 'treat'],
  },
  // 30 MIN RECIPES
  {
    id: 'bowl-002',
    name: 'Golden Garlic Fried Rice',
    subtitle: 'Wok-tossed aromatic rice with scallions & sesame',
    image: '/food/bowl.jpg',
    time: 12,
    ingredientCount: 4,
    timesCooked: 11,
    confidenceMatch: 95,
    matchLabel: '95% Match • Have 4 of 4 essentials',
    diet: 'veg',
    difficulty: 'Easy',
    rating: 4.9,
    moods: ['budget', 'normal', 'exhausted'],
  },
  {
    id: 'pasta-001',
    name: 'Garlic Pasta Aglio e Olio',
    subtitle: 'Fragrant garlic, red pepper flakes, and parsley in extra virgin oil',
    image: '/food/pasta.jpg',
    time: 15,
    ingredientCount: 5,
    timesCooked: 24,
    confidenceMatch: 100,
    matchLabel: '100% Match • All ingredients ready',
    diet: 'veg',
    difficulty: 'Easy',
    rating: 4.9,
    moods: ['spicy', 'treat', 'normal', 'budget'],
  },
  {
    id: 'salmon-001',
    name: 'Seared Salmon Rice Bowl',
    subtitle: 'Tamari-glazed crispy skin salmon with steamed rice & cucumber',
    image: '/food/bowl.jpg',
    time: 20,
    ingredientCount: 5,
    timesCooked: 11,
    confidenceMatch: 90,
    matchLabel: '90% Match • Protein packed',
    diet: 'non-veg',
    difficulty: 'Medium',
    rating: 4.9,
    moods: ['treat', 'healthy', 'normal'],
  },
  {
    id: 'burger-001',
    name: 'Gourmet Brioche Smash Burger',
    subtitle: 'Caramelized onions, aged cheddar & garlic aioli on brioche',
    image: '/food/burger.jpg',
    time: 18,
    ingredientCount: 5,
    timesCooked: 6,
    confidenceMatch: 88,
    matchLabel: '88% Match • Chef favorite',
    diet: 'non-veg',
    difficulty: 'Medium',
    rating: 4.8,
    moods: ['treat', 'spicy'],
  },
  {
    id: 'salad-002',
    name: 'Quinoa Green Goddess Bowl',
    subtitle: 'Tri-color fluffy quinoa, avocado fans, spinach & lemon vinaigrette',
    image: '/food/salad.jpg',
    time: 25,
    ingredientCount: 5,
    timesCooked: 8,
    confidenceMatch: 95,
    matchLabel: '95% Match • High fiber',
    diet: 'vegan',
    difficulty: 'Easy',
    rating: 4.8,
    moods: ['healthy', 'normal'],
  },
  // 1 HOUR+ RECIPES
  {
    id: 'stew-001',
    name: 'Slow-Braised Chickpea & Tomato Stew',
    subtitle: 'Simmered with cumin, smoked paprika, garlic & olive oil till rich',
    image: '/food/bowl.jpg',
    time: 60,
    ingredientCount: 6,
    timesCooked: 7,
    confidenceMatch: 92,
    matchLabel: '92% Match • Slow simmer',
    diet: 'vegan',
    difficulty: 'Easy',
    rating: 4.9,
    moods: ['healthy', 'budget', 'normal'],
  },
  {
    id: 'pizza-001',
    name: 'Cast-Iron Skillet Margherita Pizza',
    subtitle: 'Slow-risen bubbly dough, crushed San Marzano tomatoes & fresh basil',
    image: '/food/pasta.jpg',
    time: 65,
    ingredientCount: 5,
    timesCooked: 9,
    confidenceMatch: 85,
    matchLabel: '85% Match • Weekend project',
    diet: 'veg',
    difficulty: 'Medium',
    rating: 4.9,
    moods: ['treat', 'normal'],
  },
  {
    id: 'curry-001',
    name: 'Fiery Slow-Simmered Rogan Curry',
    subtitle: 'Aromatic Kashmiri chilies, toasted spices & slow-caramelized gravy',
    image: '/food/bowl.jpg',
    time: 75,
    ingredientCount: 7,
    timesCooked: 5,
    confidenceMatch: 80,
    matchLabel: '80% Match • Intense heat',
    diet: 'non-veg',
    difficulty: 'Medium',
    rating: 4.8,
    moods: ['spicy', 'treat'],
  },
]

// ── 2. RECENTLY COOKED ───────────────────────────────────────────────
export const RECENTLY_COOKED_RECIPES: RecentlyCookedRecipe[] = [
  {
    id: 'pasta-001',
    name: 'Spicy Tomato Fusilli',
    image: '/food/pasta.jpg',
    lastCookedDate: 'Yesterday',
    timesCooked: 14,
    time: 20,
    ingredientCount: 5,
  },
  {
    id: 'salad-001',
    name: 'Mediterranean Salad',
    image: '/food/salad.jpg',
    lastCookedDate: '3 days ago',
    timesCooked: 9,
    time: 10,
    ingredientCount: 5,
  },
  {
    id: 'bowl-001',
    name: 'Salmon Rice Bowl',
    image: '/food/bowl.jpg',
    lastCookedDate: 'Last Sunday',
    timesCooked: 5,
    time: 25,
    ingredientCount: 6,
  },
  {
    id: 'yogurt-001',
    name: 'Berry Yogurt Parfait',
    image: '/food/yogurt.jpg',
    lastCookedDate: 'Last week',
    timesCooked: 12,
    time: 5,
    ingredientCount: 4,
  },
]

// ── 3. CHEF'S PICK ───────────────────────────────────────────────────
export const CHEFS_PICK_RECIPE: ChefsPickRecipe = {
  id: 'pasta-001',
  name: 'Spicy Garlic & Tomato Fusilli',
  tagline: 'Chef’s Afternoon Selection',
  description: 'Slow-simmered cherry tomatoes, toasted garlic slivers, and chili oil emulsified over al dente spirals.',
  image: '/food/pasta.jpg',
  time: 15,
  ingredientCount: 5,
  match: 98,
  reason: 'Perfect for lunch • Ready in 15 minutes',
  mealType: 'Lunch',
}

// ── 4. GAMIFICATION STREAK ───────────────────────────────────────────
export function getCookingStreakData(savedCount = 0, completedCount = 0): GamificationStreak {
  return {
    streakDays: completedCount > 0 ? Math.min(completedCount, 7) : 0,
    recipesCompleted: completedCount,
    favoritesSaved: savedCount,
  }
}

// ── 5. SMART SEARCH INGREDIENT PILLS ──────────────────────────────────
export const INGREDIENT_SUGGESTIONS = [
  { name: 'Garlic' },
  { name: 'Eggs' },
  { name: 'Tomatoes' },
  { name: 'Pasta' },
  { name: 'Avocado' },
  { name: 'Spinach' },
  { name: 'Onions' },
  { name: 'Rice' },
  { name: 'Olive Oil' },
  { name: 'Cheese' },
]

export function computePantrySnapshot(pantryCount: number, recipesCount: number) {
  return {
    ingredientsAvailable: pantryCount,
    recipesYouCanCook: recipesCount,
  }
}

// ── 6. CONVERSATIONAL ASSISTANT MESSAGES ──────────────────────────────
export function getAssistantHeadline(timeFilter: CookingTimeFilter, customMinutes = 20): string {
  switch (timeFilter) {
    case '5m':
      return 'What can I whip up in 5 minutes?'
    case '10m':
      return 'Got 10 minutes to eat well?'
    case '30m':
      return 'Great weeknight meals in 30 minutes.'
    case '1h':
      return 'Slow, satisfying food worth the time.'
    case 'custom':
      return `Cook ready in ${customMinutes} minutes or less.`
    default:
      return 'How much time do you have to cook?'
  }
}

export function getAssistantMessage(
  timeFilter: CookingTimeFilter,
  mood: CookingMood | null,
  customMinutes = 20
): string {
  if (mood === 'exhausted') {
    if (timeFilter === '5m') return 'Zero prep, instant comfort. No chopping and minimal clean-up.'
    if (timeFilter === '10m') return 'Low effort, zero stress dinners ready before your kettle cools.'
    return 'Comforting, simple recipes that let you kick back sooner.'
  }

  if (mood === 'treat') {
    if (timeFilter === '5m') return 'A quick, luxurious pick-me-up made with what you have.'
    if (timeFilter === '30m') return 'You earned this. 30-minute culinary rewards crafted from pantry staples.'
    if (timeFilter === '1h') return 'Full gourmet treatment: deep caramelization and layered textures.'
    return 'Indulgent, restaurant-worthy flavors in the time you have.'
  }

  if (mood === 'healthy') {
    if (timeFilter === '5m') return 'Raw, vibrant superfoods and clean fuel ready right away.'
    if (timeFilter === '10m') return 'Crisp greens, wholesome grains, and light dressing in 10 minutes.'
    return 'Nutrient-rich, body-fueling dishes that keep energy high.'
  }

  if (mood === 'spicy') {
    if (timeFilter === '5m') return 'Fiery aromatics and chili oil for an immediate punch.'
    if (timeFilter === '10m') return 'Bold, sizzling pan dishes with fragrant chili and garlic.'
    return 'Deep heat, warming spices, and layered pepper notes.'
  }

  if (mood === 'budget') {
    if (timeFilter === '5m') return 'Clever pantry staples with zero waste and maximum taste.'
    return 'Scrappy kitchen magic: turning rice, pasta, and eggs into golden meals.'
  }

  // Normal / Default
  switch (timeFilter) {
    case '5m':
      return 'Super-fast assemblies for when minutes count.'
    case '10m':
      return 'Quick, hot meals that beat ordering takeout every time.'
    case '30m':
      return 'The sweet spot for balanced, delicious home cooking.'
    case '1h':
      return 'Rich, simmering aromas filling the kitchen while you unwind.'
    case 'custom':
      return `Tailored to your exact ${customMinutes}-minute schedule.`
    default:
      return 'Tell Mise your available time and vibe — we will handle the rest.'
  }
}
