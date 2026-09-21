import { NextRequest, NextResponse } from 'next/server'
import { callAIWithFallback } from '@/lib/generateRecipes'
import { RegionalAIRecipe, IndianRegion } from '@/lib/recipeTypes'

// Server memory cache: region_diet -> RegionalRecipe[]
const regionalAiCache = new Map<string, { timestamp: number; recipes: RegionalAIRecipe[] }>()
const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes

const FALLBACK_IMAGES: Record<string, string[]> = {
  Kerala: ['/food/egg_roast.jpg', '/food/tomato_thoran.jpg', '/food/veg_stew.jpg', '/food/lemon_rice.jpg'],
  'Tamil Nadu': ['/food/lemon_sevai.jpg', '/food/kara_kuzhambu.jpg', '/food/tomato_rice.jpg', '/food/bowl.jpg'],
  Maharashtra: ['/food/poha.jpg', '/food/misal_pav.jpg', '/food/bowl.jpg', '/food/burger.jpg'],
  Karnataka: ['/food/yogurt.jpg', '/food/lemon_rice.jpg', '/food/salad.jpg', '/food/pasta.jpg'],
  'North Indian': ['/food/bowl.jpg', '/food/pasta.jpg', '/food/yogurt.jpg', '/food/salad.jpg'],
  All: ['/food/bowl.jpg', '/food/lemon_rice.jpg', '/food/egg_roast.jpg', '/food/poha.jpg'],
}

function getRandomImageForRegion(region: string, idx: number): string {
  const list = FALLBACK_IMAGES[region] || FALLBACK_IMAGES.All
  return list[idx % list.length]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const region = (body.region || 'Kerala') as IndianRegion
    const diet = body.diet || 'all'
    const pantry: string[] = Array.isArray(body.pantry) ? body.pantry : []

    // Cache key based on region + diet
    const cacheKey = `${region.toLowerCase()}_${diet.toLowerCase()}`
    const cached = regionalAiCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ recipes: cached.recipes, cached: true })
    }

    const pantryText = pantry.length > 0 ? pantry.slice(0, 10).join(', ') : 'common Indian staples'

    const prompt = `You are a culinary AI and master Indian regional chef.
Generate 4 distinct, authentic recipes strictly from the region: "${region}" (India).
Pantry items available: ${pantryText}.
Dietary preference: ${diet}.

Requirements:
1. Provide authentic regional recipes spanning different times:
   - At least 1 under 5 minutes (quick assembly/tempering/thoran/poha/chaat/rasam)
   - At least 1 between 10-15 minutes (skillet roast/tempered rice/bhurji)
   - At least 1 around 25-30 minutes (simmered curry/stew/dal)
   - At least 1 weekend feast (biryani/sukka/specialty)
2. Use authentic regional language name for regionalName (e.g. Malayalam for Kerala, Tamil for Tamil Nadu, Marathi for Maharashtra, Kannada for Karnataka, Punjabi/Hindi for North India).
3. Set timeTier strictly to one of: "5m", "15m", "30m", "weekend".
4. Set time to realistic prep & cook duration in minutes.
5. Set diet to "veg", "vegan", or "non-veg".
6. Return ONLY a valid JSON array of objects, starting directly with [ and ending with ].

JSON format per recipe:
{
  "id": "ai-${region.toLowerCase().replace(/\\s+/g, '-')}-slug",
  "name": "Recipe Name in English",
  "regionalName": "Authentic Vernacular Name",
  "region": "${region}",
  "timeTier": "5m" | "15m" | "30m" | "weekend",
  "time": 5 | 15 | 30 | 45,
  "subtitle": "Appetizing 1-sentence description with key spices & flavor profile",
  "diet": "veg" | "vegan" | "non-veg",
  "difficulty": "Quick" | "Easy" | "Medium" | "Feast",
  "ingredients": [
    { "name": "Ingredient Name", "quantity": "amount" }
  ],
  "steps": [
    { "id": "step-1", "step_order": 1, "instruction": "Clear cooking step", "duration_minutes": 2, "parallel": false }
  ],
  "moods": ["quick", "comfort", "spicy", "healthy", "treat"]
}`

    let raw = ''
    try {
      raw = await callAIWithFallback(prompt)
    } catch (err) {
      console.warn('[regional-ai-recipes] AI generation call failed, returning empty:', err)
      return NextResponse.json({ recipes: [], cached: false })
    }

    // Clean JSON response
    let cleaned = raw.trim()
    const match = cleaned.match(/\\[[\\s\\S]*\\]/)
    if (match) {
      cleaned = match[0]
    }

    let parsed: any[] = []
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.warn('[regional-ai-recipes] Could not parse AI response as JSON:', raw.slice(0, 150))
      return NextResponse.json({ recipes: [], cached: false })
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ recipes: [], cached: false })
    }

    // Validate and normalize recipes
    const validatedRecipes: RegionalAIRecipe[] = parsed
      .filter((r) => r && typeof r.name === 'string' && r.name.trim().length > 0)
      .map((r, idx) => {
        const timeVal = Number(r.time || 15)
        let tier: '5m' | '15m' | '30m' | 'weekend' = '15m'
        if (timeVal <= 7 || r.timeTier === '5m') tier = '5m'
        else if (timeVal <= 18 || r.timeTier === '15m') tier = '15m'
        else if (timeVal <= 35 || r.timeTier === '30m') tier = '30m'
        else tier = 'weekend'

        return {
          id: `ai-${region.toLowerCase().replace(/\\s+/g, '-')}-${Date.now().toString(36)}-${idx}`,
          name: String(r.name).trim(),
          regionalName: String(r.regionalName || r.name).trim(),
          region: (region === 'All' ? 'Pan-Indian' : region) as RegionalAIRecipe['region'],
          timeTier: tier,
          time: timeVal,
          image: getRandomImageForRegion(region, idx),
          subtitle: String(r.subtitle || `Authentic ${region} style preparation`).trim(),
          diet: (['veg', 'non-veg', 'vegan', 'jain'].includes(r.diet) ? r.diet : 'veg') as any,
          difficulty: (['Quick', 'Easy', 'Medium', 'Feast'].includes(r.difficulty) ? r.difficulty : 'Easy') as any,
          ingredients: Array.isArray(r.ingredients)
            ? r.ingredients.map((ing: any) => ({
                name: String(ing.name || ing),
                quantity: String(ing.quantity || 'to taste'),
              }))
            : [{ name: 'Spices', quantity: 'to taste' }],
          steps: Array.isArray(r.steps) && r.steps.length > 0
            ? r.steps.map((s: any, sIdx: number) => ({
                id: `step-${sIdx + 1}`,
                step_order: sIdx + 1,
                instruction: String(s.instruction || s),
                duration_minutes: Number(s.duration_minutes || 2),
                parallel: Boolean(s.parallel),
              }))
            : [
                { id: 'step-1', step_order: 1, instruction: 'Prepare ingredients and heat oil with spices.', duration_minutes: 3, parallel: false },
                { id: 'step-2', step_order: 2, instruction: 'Sauté and simmer until fully cooked.', duration_minutes: 10, parallel: false },
              ],
          moods: Array.isArray(r.moods) && r.moods.length > 0 ? r.moods : ['quick', 'comfort', 'spicy'],
        }
      })

    // Store in cache
    if (validatedRecipes.length > 0) {
      regionalAiCache.set(cacheKey, { timestamp: Date.now(), recipes: validatedRecipes })
    }

    return NextResponse.json({ recipes: validatedRecipes, cached: false })
  } catch (err) {
    console.error('[POST /api/regional-ai-recipes] Error:', err)
    return NextResponse.json({ recipes: [], error: 'Failed to generate regional recipes' }, { status: 500 })
  }
}
