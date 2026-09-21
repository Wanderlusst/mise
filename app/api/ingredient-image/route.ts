import { NextRequest, NextResponse } from 'next/server'
import { searchIngredientImage, cleanIngredientName, IngredientImageResult } from '@/lib/ingredientImages'

// In-memory server cache to minimize Pexels API rate usage
const SERVER_CACHE = new Map<string, { result: IngredientImageResult; timestamp: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawName = searchParams.get('name') || ''
  const cleanName = cleanIngredientName(rawName)

  if (!cleanName) {
    return NextResponse.json(
      { ingredient: '', image: null },
      { status: 400 }
    )
  }

  // Check server-side memory cache
  const cached = SERVER_CACHE.get(cleanName)
  const now = Date.now()
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.result, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'HIT',
      },
    })
  }

  const apiKey = process.env.PEXELS_API_KEY || ''
  if (!apiKey) {
    console.warn('[api/ingredient-image] PEXELS_API_KEY is not set in environment variables.')
    return NextResponse.json({
      ingredient: cleanName,
      image: null,
    })
  }

  const result = await searchIngredientImage(cleanName, apiKey)

  // Store in cache
  SERVER_CACHE.set(cleanName, { result, timestamp: now })

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      'X-Cache': 'MISS',
    },
  })
}
