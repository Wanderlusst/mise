import { NextRequest, NextResponse } from 'next/server'
import { generateRecipesWithAI, GenerateInput } from '@/lib/generateRecipes'

export async function POST(req: NextRequest) {
  try {
    const body: GenerateInput = await req.json()
    const recipes = await generateRecipesWithAI(body)

    if (recipes.length === 0) {
      return NextResponse.json(
        { error: 'AI was unable to generate recipes' },
        { status: 502 }
      )
    }

    return NextResponse.json({ recipes, source: 'ai-generated' })
  } catch (err) {
    console.error('[POST /api/generate-recipes]', err)
    return NextResponse.json(
      { error: 'Recipe generation failed', details: String(err) },
      { status: 500 }
    )
  }
}
