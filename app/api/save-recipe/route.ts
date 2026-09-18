import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { recipeId, recipe, ingredientsSnapshot } = body

    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 })
    }

    // Try persisting to Supabase if available
    try {
      const { data, error } = await supabaseAdmin
        .from('saved_recipes')
        .upsert(
          {
            recipe_id: recipeId,
            recipe_data: recipe,
            ingredients_snapshot: ingredientsSnapshot,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'recipe_id' }
        )
        .select()

      if (error) {
        // If table saved_recipes doesn't exist yet, we still return success with local acknowledgment
        console.warn('[save-recipe] Supabase table notice:', error.message)
        return NextResponse.json({ success: true, persisted: 'client-only', notice: error.message })
      }

      return NextResponse.json({ success: true, persisted: 'supabase', data })
    } catch (dbErr: any) {
      console.warn('[save-recipe] Supabase execution notice:', dbErr?.message)
      return NextResponse.json({ success: true, persisted: 'client-fallback' })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
