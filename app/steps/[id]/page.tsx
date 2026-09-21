'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ChefHat } from 'lucide-react'
import { useSavedRecipes, SEED_SAVED_RECIPES } from '@/lib/useSavedRecipes'
import CookingExperience, { CookingRecipe } from '@/components/cooking/CookingExperience'

function StepsContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const recipeId = params.id as string

  const ingredientsParam = searchParams.get('ingredients') ?? ''
  const servings = searchParams.get('servings') ?? '2'
  const ingredients = ingredientsParam.split(',').filter(Boolean)

  const [recipe, setRecipe] = useState<CookingRecipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getSavedRecipe } = useSavedRecipes()

  useEffect(() => {
    // 1. Check local saved recipe store
    const cached = getSavedRecipe(recipeId)
    if (cached && cached.steps && cached.steps.length > 0) {
      setRecipe({
        id: cached.id,
        name: cached.name,
        category: cached.category,
        diet: cached.diet,
        time_minutes: cached.time,
        servings: cached.servings || 2,
        image_url: cached.image,
        ingredients: (cached.ingredients || []).map((i) => ({
          name: i.name,
          quantity: i.quantity,
          optional: Boolean(i.optional),
        })),
        steps: cached.steps.map((s, idx) => ({
          id: s.id || `step-${idx}`,
          step_order: s.step_order || idx + 1,
          instruction: s.instruction,
          duration_minutes: s.duration_minutes,
          parallel: Boolean(s.parallel),
        })),
        adapted: true,
      })
      setLoading(false)
      return
    }

    // 2. Check seed recipes
    const seed = SEED_SAVED_RECIPES.find((r) => r.id === recipeId)
    if (seed && seed.steps && seed.steps.length > 0) {
      setRecipe({
        id: seed.id,
        name: seed.name,
        category: seed.category,
        diet: seed.diet,
        time_minutes: seed.time,
        servings: seed.servings || 2,
        image_url: seed.image,
        ingredients: (seed.ingredients || []).map((i) => ({
          name: i.name,
          quantity: i.quantity,
          optional: Boolean(i.optional),
        })),
        steps: seed.steps.map((s, idx) => ({
          id: s.id || `step-${idx}`,
          step_order: s.step_order || idx + 1,
          instruction: s.instruction,
          duration_minutes: s.duration_minutes,
          parallel: Boolean(s.parallel),
        })),
        adapted: true,
      })
      setLoading(false)
      return
    }

    // 3. Check sessionStorage for transient recipe from search/results
    if (typeof window !== 'undefined') {
      try {
        const stored = window.sessionStorage.getItem(`mise_active_recipe_${recipeId}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && parsed.steps && parsed.steps.length > 0) {
            setRecipe(parsed)
            setLoading(false)
            return
          }
        }
      } catch {
        // ignore
      }
    }

    // 4. Adapt recipe from API
    async function fetchAdapted() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/adapt-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeId,
            ingredients,
            servings: Number(servings),
            timeConstraint: null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to adapt recipe')

        setRecipe({
          id: data.id,
          name: data.name,
          category: data.category,
          diet: data.diet,
          time_minutes: data.time_minutes,
          servings: data.servings || Number(servings),
          image_url: data.image_url,
          ingredients: (data.ingredients || []).map((i: { name: string; quantity: string; optional?: boolean }) => ({
            name: i.name,
            quantity: i.quantity,
            optional: Boolean(i.optional),
          })),
          steps: (data.steps || []).map((s: { id: string; step_order: number; instruction: string; duration_minutes: number | null; parallel?: boolean }, idx: number) => ({
            id: s.id || `step-${idx}`,
            step_order: s.step_order || idx + 1,
            instruction: s.instruction,
            duration_minutes: s.duration_minutes,
            parallel: Boolean(s.parallel),
          })),
          adapted: data.adapted,
          adaptationReason: data.adaptationReason,
        })
      } catch (err) {
        // Graceful fallback to first seed recipe if API key missing or offline
        const fallback = SEED_SAVED_RECIPES[0]
        if (fallback && fallback.steps) {
          setRecipe({
            id: fallback.id,
            name: fallback.name,
            category: fallback.category,
            diet: fallback.diet,
            time_minutes: fallback.time,
            servings: fallback.servings || 2,
            image_url: fallback.image,
            ingredients: fallback.ingredients || [],
            steps: fallback.steps,
            adapted: true,
          })
        } else {
          setError(String(err))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAdapted()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId])

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 max-w-mobile mx-auto text-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-2xl shadow-lg mb-4 text-white"
        >
          👨‍🍳
        </motion.div>
        <h2 className="text-xl font-apple font-bold text-[var(--text-primary)] mb-1 tracking-tight">
          Preparing Cooking Station…
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Tailoring temperature, timers, and step sequencing.
        </p>
      </div>
    )
  }

  // ── Error View ──
  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-mobile mx-auto text-center">
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-lg">
          <span className="text-3xl mb-2 block">🍳</span>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Could not start cooking
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            {error || 'Recipe details could not be loaded.'}
          </p>
          <button
            onClick={() => router.push('/mobile')}
            className="w-full py-2.5 rounded-full bg-[var(--accent)] text-white font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Return to Kitchen
          </button>
        </div>
      </div>
    )
  }

  // ── World-Class Cooking Experience ──
  return (
    <div className="relative min-h-screen">
      {/* Background canvas gradient */}
      <div className="mise-bg" aria-hidden="true" />

      {/* Main Cooking View */}
      <CookingExperience
        recipe={recipe}
        onExit={() => router.push('/mobile')}
        onViewSimilar={() => router.push('/mobile')}
        onViewTicket={() =>
          router.push(
            `/ticket/${recipeId}?ingredients=${encodeURIComponent(ingredientsParam)}&servings=${servings}`
          )
        }
      />
    </div>
  )
}

export default function StepsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <StepsContent />
    </Suspense>
  )
}
