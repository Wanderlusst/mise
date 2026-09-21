import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Request body required' }, { status: 400 })
    }

    const { recipeId, recipe, ingredientsSnapshot } = body

    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: sign-in or guest session required' },
        { status: 401 }
      )
    }

    const snapshot =
      ingredientsSnapshot ??
      (recipe?.ingredients
        ? recipe.ingredients.map((i: any) => (typeof i === 'string' ? i : i.name))
        : [])

    const { data, error } = await supabase
      .from('saved_recipes')
      .upsert(
        {
          recipe_id: recipeId,
          user_id: user.id,
          recipe_data: recipe ?? {},
          ingredients_snapshot: snapshot,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'recipe_id,user_id' }
      )
      .select()

    if (error) {
      console.error('[save-recipe] Supabase error:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      persisted: 'supabase',
      recipeId,
      ingredientsSnapshot: snapshot,
      data,
    })
  } catch (err: any) {
    console.error('[POST /api/save-recipe] Unhandled error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const recipeId = searchParams.get('recipeId')

    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId query parameter is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: sign-in or guest session required' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[save-recipe DELETE] Supabase error:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, unsaved: recipeId })
  } catch (err: any) {
    console.error('[DELETE /api/save-recipe] Unhandled error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
