import type { MetadataRoute } from 'next'
import { READY_TO_COOK_RECIPES, CHEFS_PICK_RECIPE, RECENTLY_COOKED_RECIPES } from '@/lib/homeData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mise-cookbook.app'
  const currentDate = new Date().toISOString()

  // Core navigational routes
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mobile`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mobile/scan`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mobile/chat`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mobile/saved`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mobile/settings`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Recipe details routes (deduplicated)
  const additionalRecipeIds = [
    'curry-002',
    'bowl-001',
    'shakshuka-003',
    'stirfry-004',
    'paneer-tikka-005',
  ]

  const uniqueIds = new Set<string>()
  const recipeRoutes: MetadataRoute.Sitemap = []

  const addRecipeRoute = (id: string) => {
    if (id && !uniqueIds.has(id)) {
      uniqueIds.add(id)
      recipeRoutes.push({
        url: `${baseUrl}/mobile/detail/${id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  if (CHEFS_PICK_RECIPE?.id) addRecipeRoute(CHEFS_PICK_RECIPE.id)
  READY_TO_COOK_RECIPES.forEach((r) => addRecipeRoute(r.id))
  RECENTLY_COOKED_RECIPES.forEach((r) => addRecipeRoute(r.id))
  additionalRecipeIds.forEach((id) => addRecipeRoute(id))

  return [...coreRoutes, ...recipeRoutes]
}
