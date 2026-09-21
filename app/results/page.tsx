'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { Suspense } from 'react'

interface RecipeMatch {
  id: string
  name: string
  category: string
  timeMinutes: number
  diet: string
  matchScore: number
  matchedFromPantry: number
  matchedFromStaples: number
  requiredIngredientCount: number
  missingIngredients: string[]
  allIngredients?: Array<{ name: string; quantity: string; optional: boolean; unconfirmed?: boolean }>
}

const CATEGORY_EMOJI: Record<string, string> = {
  drink: '🧃', salad: '🥗', yogurt: '🥛', snack: '🍿', meal: '🍛',
}
const DIET_COLOR: Record<string, string> = {
  veg: 'var(--success)', 'non-veg': 'var(--accent)', vegan: 'var(--success)', jain: 'var(--accent-text-on-light)',
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [recipes, setRecipes] = useState<RecipeMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const time = searchParams.get('time')
  const category = searchParams.get('category')
  const diet = searchParams.get('diet')
  const ingredientsParam = searchParams.get('ingredients')
  const servings = searchParams.get('servings') ?? '2'

  const ingredients = ingredientsParam ? ingredientsParam.split(',') : null

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/match-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: time ? Number(time) : null,
            category: category || null,
            ingredients: ingredients,
            diet: diet || null,
            servings: Number(servings),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to fetch recipes')
        setRecipes(data.recipes ?? [])
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectRecipe = (recipe: RecipeMatch) => {
    const ing = recipe.allIngredients?.map((i) => i.name).join(',') ?? ''
    const url = `/steps/${recipe.id}?ingredients=${encodeURIComponent(ing)}&servings=${servings}`
    router.push(url)
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <button
          onClick={() => router.back()}
          className="btn-ghost"
          style={{ marginBottom: '1.5rem' }}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-headline" style={{ marginBottom: '0.5rem' }}>
          {loading ? 'Finding recipes…' : recipes.length === 0 ? 'No matches found' : `${recipes.length} recipe${recipes.length > 1 ? 's' : ''} found`}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {time && <span className="badge badge-accent">⏱ {time} min</span>}
          {category && <span className="badge badge-accent">{CATEGORY_EMOJI[category]} {category}</span>}
          {diet && <span className="badge badge-muted">{diet}</span>}
          {ingredients && <span className="badge badge-muted">{ingredients.length} ingredient{ingredients.length > 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div className="spinner" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>⚠️ {error}</p>
          <button className="btn-ghost" style={{ marginTop: '1rem' }} onClick={() => router.push('/')}>
            Start over
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && recipes.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
          <h2 className="text-title" style={{ marginBottom: '0.5rem' }}>No recipes matched your filters</h2>
          <p className="text-small" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Try relaxing the time limit, removing the diet filter, or listing different ingredients.
          </p>
          <button className="btn-primary" onClick={() => router.push('/')}>Try again</button>
        </div>
      )}

      {/* Recipe cards — ONE stagger animation moment */}
      {!loading && recipes.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {recipes.map((recipe, idx) => {
            const hasUnconfirmed = recipe.allIngredients?.some((i) => i.unconfirmed)
            const matchPct = Math.round(recipe.matchScore * 100)

            return (
              <motion.div
                key={recipe.id}
                variants={cardVariants}
                className="recipe-card"
                onClick={() => handleSelectRecipe(recipe)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectRecipe(recipe)}
                aria-label={`Select ${recipe.name}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{CATEGORY_EMOJI[recipe.category] ?? '🍽'}</span>
                      <h2 className="text-title font-apple">{recipe.name}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <span className="badge badge-muted">⏱ {recipe.timeMinutes} min</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: DIET_COLOR[recipe.diet] ?? 'var(--text-muted)' }}>
                        {recipe.diet}
                      </span>
                      {hasUnconfirmed && (
                        <span className="badge badge-amber">⚠ Confirm ingredients</span>
                      )}
                    </div>

                    {/* Match score bar */}
                    {!hasUnconfirmed && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <span className="text-small" style={{ color: 'var(--text-muted)' }}>
                            {recipe.matchedFromStaples > 0
                              ? `${recipe.matchedFromPantry} of your ingredients + ${recipe.matchedFromStaples} pantry staple${recipe.matchedFromStaples === 1 ? '' : 's'}`
                              : `${recipe.matchedFromPantry}/${recipe.requiredIngredientCount} of your ingredients`}
                          </span>
                          <span className="text-small font-mono tabular-nums" style={{ color: 'var(--accent)', fontWeight: 600 }}>{matchPct}%</span>
                        </div>
                        <div className="match-bar-bg">
                          <motion.div
                            className="match-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${matchPct}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 + 0.3, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Missing ingredients */}
                    {recipe.missingIngredients.length > 0 && (
                      <div style={{ marginTop: '0.875rem' }}>
                        <p className="text-small" style={{ color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                          Missing: {' '}
                          <span style={{ color: 'var(--amber)' }}>
                            {recipe.missingIngredients.join(', ')}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div style={{ color: 'var(--text-muted)', fontSize: '1.25rem', paddingTop: '0.25rem', flexShrink: 0 }}>→</div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}>
        <div className="spinner" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
