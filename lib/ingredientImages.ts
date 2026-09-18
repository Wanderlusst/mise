/**
 * Ingredient Image Service
 * Fetches, validates, and caches real isolated ingredient photography via Pexels API.
 * Adheres to strict rejection criteria (no bowls, meals, recipes, cooking scenes, mixed produce)
 * and falls back to designated ingredient emojis when no isolated photo is available.
 */

export interface PexelsPhotoSrc {
  original: string
  large2x?: string
  large?: string
  medium?: string
  small?: string
  portrait?: string
  landscape?: string
  tiny?: string
}

export interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url?: string
  photographer_id?: number
  avg_color?: string
  src: PexelsPhotoSrc
  liked?: boolean
  alt?: string
}

export interface PexelsSearchResponse {
  page: number
  per_page: number
  photos: PexelsPhoto[]
  total_results: number
  next_page?: string
}

export interface IngredientImageResult {
  ingredient: string
  image: string | null
  emoji: string
  photoId?: number
  photographer?: string
  alt?: string
  validated?: boolean
}

// ─── Ingredient Emoji Fallback Map ──────────────────────────────────────────────
export const INGREDIENT_EMOJI_MAP: Record<string, string> = {
  // Required core defaults from specification
  cucumber: '🥒',
  onion: '🧅',
  lemon: '🍋',
  avocado: '🥑',
  tomato: '🍅',
  carrot: '🥕',
  potato: '🥔',

  // Common produce & pantry items
  garlic: '🧄',
  broccoli: '🥦',
  cabbage: '🥬',
  lettuce: '🥬',
  spinach: '🍃',
  greens: '🥬',
  kale: '🥬',
  corn: '🌽',
  pepper: '🌶️',
  capsicum: '🫑',
  bellpepper: '🫑',
  chili: '🌶️',
  eggplant: '🍆',
  aubergine: '🍆',
  mushroom: '🍄',
  beet: '🫐',
  beetroot: '🫐',
  pea: '🫛',
  peas: '🫛',
  ginger: '🫚',
  radish: '🥕',
  zucchini: '🥒',
  pumpkin: '🎃',
  squash: '🎃',

  // Herbs & seasonings
  herb: '🌿',
  herbs: '🌿',
  basil: '🌿',
  mint: '🌿',
  parsley: '🌿',
  cilantro: '🌿',
  coriander: '🌿',
  rosemary: '🌿',
  thyme: '🌿',
  oregano: '🌿',
  salt: '🧂',
  pepper_spice: '🧂',
  sugar: '🍬',
  oil: '🫒',
  olive: '🫒',
  olives: '🫒',
  honey: '🍯',

  // Proteins & dairy
  egg: '🥚',
  eggs: '🥚',
  cheese: '🧀',
  parmesan: '🧀',
  cheddar: '🧀',
  mozzarella: '🧀',
  paneer: '🧀',
  butter: '🧈',
  milk: '🥛',
  cream: '🥛',
  yogurt: '🥣',
  chicken: '🍗',
  poultry: '🍗',
  beef: '🥩',
  steak: '🥩',
  meat: '🥩',
  pork: '🥓',
  bacon: '🥓',
  ham: '🥓',
  fish: '🐟',
  salmon: '🐟',
  tuna: '🐟',
  shrimp: '🍤',
  prawn: '🍤',
  tofu: '🧊',

  // Grains, pasta & bakery
  pasta: '🍝',
  fusilli: '🍝',
  penne: '🍝',
  spaghetti: '🍝',
  noodle: '🍜',
  noodles: '🍜',
  rice: '🍚',
  quinoa: '🌾',
  oats: '🌾',
  grain: '🌾',
  flour: '🌾',
  bread: '🍞',
  toast: '🍞',

  // Fruits
  apple: '🍎',
  banana: '🍌',
  orange: '🍊',
  lime: '🍋‍🟩',
  strawberry: '🍓',
  blueberry: '🫐',
  berry: '🍓',
  grape: '🍇',
  grapes: '🍇',
  watermelon: '🍉',
  peach: '🍑',
  mango: '🥭',
  pineapple: '🍍',
  coconut: '🥥',

  // Nuts & sweets
  nut: '🥜',
  nuts: '🥜',
  peanut: '🥜',
  almond: '🥜',
  walnut: '🥜',
  cashew: '🥜',
  chocolate: '🍫',
  coffee: '☕',
  tea: '🍵',
  water: '💧',
}

/**
 * Strips common measurements, weights, and cooking prep descriptors
 * to extract the canonical ingredient name (e.g. "1/2 cup diced red onion" -> "red onion").
 */
export function cleanIngredientName(rawName: string): string {
  if (!rawName) return ''

  let name = rawName.toLowerCase().trim()

  // Remove parenthetical details e.g. "(optional)", "(pitted)", "(about 2 cups)"
  name = name.replace(/\([^)]*\)/g, ' ')

  // Remove fractions, numbers, and measurement units (1/2, 2.5, 200g, 1 cup, 2 tbsp, etc.)
  name = name.replace(/^[\d\s/.,¼½¾⅓⅔⅛⅜⅝⅞-]+/, ' ')
  name = name.replace(
    /\b(cups?|tbsps?|tbsp|tsps?|tsp|grams?|g|kg|kgs?|oz|ounces?|lbs?|pounds?|pinch|handful|stalks?|cloves?|slices?|pieces?|bunch|bunches|medium|large|small|fresh|organic|raw|ripe)\b/gi,
    ' '
  )

  // Remove common culinary prep words
  name = name.replace(
    /\b(diced|chopped|minced|sliced|shredded|crushed|peeled|pitted|grated|melted|ground|roasted|cooked|boiled|cut|trimmed|halved|quartered)\b/gi,
    ' '
  )

  // Clean whitespace and punctuation
  name = name.replace(/[,;:+]/g, ' ').replace(/\s+/g, ' ').trim()

  return name || rawName.trim().toLowerCase()
}

/**
 * Returns the matching emoji for an ingredient, falling back to 🍽️ if unlisted.
 */
export function getIngredientEmoji(name: string): string {
  const clean = cleanIngredientName(name).toLowerCase()
  if (!clean) return '🍽️'

  // Exact match
  if (INGREDIENT_EMOJI_MAP[clean]) {
    return INGREDIENT_EMOJI_MAP[clean]
  }

  // Substring match by word tokens (longest first)
  const tokens = clean.split(/\s+/).filter(Boolean)
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i]
    // Check singular
    const singular = token.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '')
    if (INGREDIENT_EMOJI_MAP[token]) return INGREDIENT_EMOJI_MAP[token]
    if (INGREDIENT_EMOJI_MAP[singular]) return INGREDIENT_EMOJI_MAP[singular]
  }

  // Check any partial key inside string
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJI_MAP)) {
    if (clean.includes(key)) {
      return emoji
    }
  }

  return '🍽️'
}

// ─── Strict Rejection Patterns ──────────────────────────────────────────────────
// Reject: salad bowls, recipes, prepared meals, mixed vegetables, cooking scenes, kitchen photos, ingredient collections
const REJECT_PATTERNS = [
  // Bowls, plates, dishes
  /\b(bowl|bowls|ceramic bowl|glass bowl|wooden bowl|plate|plates|serving dish|platter)\b/i,

  // Meals & recipes
  /\b(salad|salads|salad mix|greek salad|caesar salad|tossed salad)\b/i,
  /\b(recipe|recipes|dish|dishes|meal|meals|prepared meal|dinner|lunch|breakfast|brunch|cuisine|supper|appetizer|appetizing|menu|plating)\b/i,
  /\b(toast|sandwich|sandwiches|burger|burgers|pizza|pizzas|soup|soups|stew|stews|curry|curries|pie|cake|dessert)\b/i,
  /\b(sauce|sauces|dip|dips|tzatziki|guacamole|dressing|condiment)\b/i,
  /\b(cooked|fried|baked|roasted|grilled|boiled|sautéed|sauteed|seasoned|steamed|braised)\b/i,

  // Fast food / processed forms (e.g. potato chips / french fries when searching for potato)
  /\b(chips|crisps|french fries|fries|wedges|fast food|finger food|snack)\b/i,

  // Mixed vegetables, markets, ingredient collections
  /\b(mixed|mix|assorted|assortment|collection|collections|variety|selection|basket|crate|bucket|buckets)\b/i,
  /\b(market display|store display|farmer'?s market|grocery store|produce aisle|supermarket)\b/i,
  /\b(vegetables and fruits|fruits and vegetables|pile of vegetables|mix of vegetables)\b/i,

  // Cooking scenes & kitchen photos
  /\b(cooking scene|kitchen|chef|cutting board|chopping board|wooden board|pan|pans|pot|pots|skillet|knife|knives)\b/i,
  /\b(hand cutting|hands cutting|cutting vegetables|chopping vegetables|stirring|culinary)\b/i,
  /\b(table setting|dining table|cloth|countertop|apron)\b/i,
]

/**
 * Validates a Pexels photo against the strict isolated ingredient criteria.
 */
export function validatePexelsPhoto(
  photo: PexelsPhoto,
  rawIngredientName: string
): { isValid: boolean; score: number; reason?: string } {
  const cleanName = cleanIngredientName(rawIngredientName)
  const text = `${photo.alt || ''} ${photo.url || ''}`.toLowerCase()

  // 1. Primary Subject Check:
  // Extract key root keywords for the ingredient (e.g. "red cabbage" -> ["cabbage", "red cabbage"])
  const words = cleanName.split(/\s+/).filter(Boolean)
  const mainWord = words[words.length - 1] || cleanName
  const rootWord = mainWord.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '')

  const hasIngredient =
    text.includes(cleanName) ||
    text.includes(mainWord) ||
    (rootWord.length >= 3 && text.includes(rootWord))

  if (!hasIngredient) {
    return {
      isValid: false,
      score: 0,
      reason: `Primary subject mismatch: '${cleanName}' not identified in photo metadata.`,
    }
  }

  // 2. Reject checks:
  for (const pattern of REJECT_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        score: 0,
        reason: `Rejected due to pattern match: ${pattern}`,
      }
    }
  }

  // 3. Positive Signals / Scoring (Preferences):
  // Preferred: single ingredient, isolated ingredient, white or clean background, grocery style, centered
  let score = 10
  if (/\b(isolated|isolation)\b/i.test(text)) score += 15
  if (/\b(white background|clean background|plain background|white surface)\b/i.test(text)) score += 20
  if (/\b(single|one|solo)\b/i.test(text)) score += 10
  if (/\b(close-up|closeup|macro)\b/i.test(text)) score += 8
  if (/\b(fresh|raw|whole|halves|half|slice|sliced)\b/i.test(text)) score += 5
  if (photo.width === photo.height) score += 5 // true square

  return { isValid: true, score }
}

/**
 * Extracts the best image URL from a Pexels Photo object in the designated fallback order:
 * 1. photo.src.medium
 * 2. photo.src.large
 * 3. photo.src.original
 */
export function getPhotoImageUrl(photo: PexelsPhoto): string | null {
  if (photo.src.medium) return photo.src.medium
  if (photo.src.large) return photo.src.large
  if (photo.src.original) return photo.src.original
  return null
}

/**
 * Searches Pexels API for an isolated ingredient image matching all validation rules.
 * If no image matches, returns null image with the appropriate fallback emoji.
 */
export async function searchIngredientImage(
  ingredientName: string,
  apiKey: string
): Promise<IngredientImageResult> {
  const cleanName = cleanIngredientName(ingredientName)
  const emoji = getIngredientEmoji(ingredientName)

  if (!apiKey || !cleanName) {
    return {
      ingredient: cleanName || ingredientName,
      image: null,
      emoji,
    }
  }

  try {
    // Format: "${ingredientName} isolated food"
    const query = `${cleanName} isolated food`
    const url = new URL('https://api.pexels.com/v1/search')
    url.searchParams.set('query', query)
    url.searchParams.set('orientation', 'square')
    url.searchParams.set('per_page', '10')

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
      next: { revalidate: 86400 }, // 24hr Next.js data cache
    })

    if (!res.ok) {
      console.warn(`[Pexels API] Request failed (${res.status}): ${res.statusText}`)
      return { ingredient: cleanName, image: null, emoji }
    }

    const data: PexelsSearchResponse = await res.json()
    const photos = data.photos || []

    // Collect validated candidates
    const validCandidates: Array<{ photo: PexelsPhoto; score: number }> = []

    for (const photo of photos) {
      const validation = validatePexelsPhoto(photo, cleanName)
      if (validation.isValid) {
        validCandidates.push({ photo, score: validation.score })
      }
    }

    if (validCandidates.length === 0) {
      return {
        ingredient: cleanName,
        image: null,
        emoji,
      }
    }

    // Sort by score descending, preserving first match on tie
    validCandidates.sort((a, b) => b.score - a.score)
    const best = validCandidates[0].photo
    const imageUrl = getPhotoImageUrl(best)

    return {
      ingredient: cleanName,
      image: imageUrl,
      emoji,
      photoId: best.id,
      photographer: best.photographer,
      alt: best.alt,
      validated: true,
    }
  } catch (error) {
    console.error(`[Pexels API] Error fetching image for '${cleanName}':`, error)
    return {
      ingredient: cleanName,
      image: null,
      emoji,
    }
  }
}
