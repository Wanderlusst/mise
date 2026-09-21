'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Users,
  Scale,
  Leaf,
  Droplets,
  Flame,
  ChefHat,
  AlertCircle,
  Info,
  CheckCircle2,
  RotateCcw,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { GlassCard } from '@/components/GlassCard'
import { PetalChart } from '@/components/PetalChart'
import { StatChip } from '@/components/StatChip'
import { CookingAnimation } from '@/components/CookingAnimation'
import IngredientThumbnail from '@/components/IngredientThumbnail'
import { useHaptic } from '@/lib/useHaptic'
import { useSavedRecipes } from '@/lib/useSavedRecipes'
import { useSettings } from '@/lib/useSettings'
import { useAuth } from '@/lib/useAuth'
import CookingStatusBanner from '@/components/cooking/CookingStatusBanner'
import CookingJourneyTimeline from '@/components/cooking/CookingJourneyTimeline'
import ChefAssistant from '@/components/cooking/ChefAssistant'
import { getIngredientMeta } from '@/lib/ingredientDetails'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RecipeStep {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number | null
  parallel: boolean
}

interface AdaptedRecipe {
  id: string
  name: string
  category: string
  diet: string
  time_minutes: number
  servings: number
  image_url?: string
  ingredients: Array<{ name: string; quantity: string; optional: boolean }>
  steps: RecipeStep[]
  adapted: boolean
  adaptationReason?: string
  substitutions?: Array<{ original: string; substitute: string; note: string }>
}

interface RecipeMatch {
  id: string
  name: string
  category: string
  timeMinutes: number
  diet: string
  matchScore: number
  allIngredients?: Array<{ name: string; quantity: string; optional: boolean }>
  steps?: RecipeStep[]
}

// ─── Petal data calculation ────────────────────────────────────────────────────
// Petals represent the user's SCANNED/CONFIRMED ingredients.
// Petal size/opacity = that ingredient's proportion of the total scanned haul.
function buildPetalData(
  confirmed: string[],
  recipeIngredients?: Array<{ name: string; quantity: string }>
) {
  const items = confirmed.length > 0 ? confirmed : (recipeIngredients?.map((i) => i.name) || [])
  if (items.length === 0) return []

  const parsed = items.map((name, idx) => {
    const matched = recipeIngredients?.find((r) => r.name.toLowerCase().includes(name.toLowerCase()))
    let weight = 20
    if (matched?.quantity) {
      const q = matched.quantity.toLowerCase()
      if (q.includes('cup')) weight = 40
      else if (q.includes('tbsp') || q.includes('tablespoon')) weight = 14
      else if (q.includes('tsp') || q.includes('teaspoon')) weight = 8
      else if (q.includes('clove')) weight = 10
      else if (q.includes('pinch')) weight = 5
      else {
        const num = parseFloat(q)
        if (!isNaN(num)) weight = Math.max(12, Math.min(50, Math.round(num * 20)))
      }
    } else {
      // Natural organic variance based on ingredient index
      const variance = [30, 24, 18, 14, 26, 20, 16, 12]
      weight = variance[idx % variance.length]
    }
    return {
      label: name.charAt(0).toUpperCase() + name.slice(1),
      weight,
    }
  })

  const totalWeight = parsed.reduce((acc, cur) => acc + cur.weight, 0)
  return parsed.map((p) => ({
    label: p.label,
    value: Math.max(8, Math.round((p.weight / totalWeight) * 100)),
  }))
}

// ─── Food image assignment ─────────────────────────────────────────────────────
const FOOD_IMAGES = ['/food/bowl.jpg', '/food/pasta.jpg', '/food/salad.jpg', '/food/yogurt.jpg']
function pickFoodImage(recipeId: string): string {
  let hash = 0
  for (let i = 0; i < recipeId.length; i++) hash = (hash * 31 + recipeId.charCodeAt(i)) & 0xffff
  return FOOD_IMAGES[hash % FOOD_IMAGES.length]
}

// ─── Step Timer ─────────────────────────────────────────────────────────────────
function StepTimer({ durationMinutes }: { durationMinutes: number }) {
  const totalSeconds = durationMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clear()
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clear()
    }
    return clear
  }, [running, clear, secondsLeft])

  const reset = () => {
    clear()
    setRunning(false)
    setSecondsLeft(totalSeconds)
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const isUrgent = secondsLeft <= 30 && secondsLeft > 0 && running
  const isDone = secondsLeft === 0

  return (
    <div className="mt-2 flex items-center gap-2">
      <motion.span
        className="text-xs font-mono tabular-nums px-2.5 py-1 rounded-full font-semibold"
        style={{
          background: isUrgent ? 'var(--bg-card)' : 'var(--bg-card)',
          color: isUrgent ? 'var(--accent)' : 'var(--accent-text-on-light)',
          border: `1px solid ${isUrgent ? 'var(--accent)' : 'var(--bg-card-border)'}`,
        }}
        animate={isUrgent ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
        transition={isUrgent ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      >
        {isDone ? '✓ Done' : timeStr}
      </motion.span>
      <button
        onClick={() => setRunning((r) => !r)}
        disabled={isDone}
        className="text-xs px-2.5 py-1 rounded-full font-medium transition-all disabled:opacity-40 cursor-pointer"
        style={{
          background: 'var(--success-bg)',
          color: 'var(--success)',
          border: '1px solid var(--success-bg)',
        }}
      >
        {running ? '⏸ Pause' : isDone ? 'Done' : '▶ Start'}
      </button>
      <button
        onClick={reset}
        className="text-xs px-2 py-1 rounded-full font-medium transition-all cursor-pointer"
        style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)' }}
      >
        ↺
      </button>
    </div>
  )
}

// ─── Group consecutive parallel steps ───────────────────────────────────────────
function groupSteps(steps: RecipeStep[]): Array<RecipeStep | RecipeStep[]> {
  const groups: Array<RecipeStep | RecipeStep[]> = []
  let i = 0
  while (i < steps.length) {
    if (steps[i].parallel) {
      const group: RecipeStep[] = [steps[i]]
      while (i + 1 < steps.length && steps[i + 1].parallel) {
        i++
        group.push(steps[i])
      }
      groups.push(group)
    } else {
      groups.push(steps[i])
    }
    i++
  }
  return groups
}

// ─── Single Step Card (cook mode) ──────────────────────────────────────────────
function StepCard({
  step,
  index,
  isActive,
  isDone,
  onClick,
}: {
  step: RecipeStep
  index: number
  isActive: boolean
  isDone: boolean
  onClick: () => void
}) {
  const { settings } = useSettings()
  const isDark = settings.theme === 'dark'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isDone ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4 cursor-pointer transition-all"
      style={{
        background: isActive ? 'var(--bg-card)' : 'var(--bg-page)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--bg-card-border)'}`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex gap-3 items-start">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
          style={{
            background: isActive ? 'var(--accent)' : isDone ? 'var(--success)' : 'var(--bg-card)',
            color: isActive || isDone ? 'white' : 'var(--text-secondary)',
            border: isActive || isDone ? 'none' : '1px solid var(--bg-card-border)',
          }}
        >
          {isDone ? '✓' : index + 1}
        </div>

        <div className="flex-1">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {step.instruction}
          </p>

          {step.duration_minutes && step.duration_minutes > 0 && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Clock size={10} strokeWidth={2} />
                {step.duration_minutes} min
              </span>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StepTimer durationMinutes={step.duration_minutes} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Ingredient Row ────────────────────────────────────────────────────────────
function IngredientRow({
  name,
  quantity,
}: {
  name: string
  quantity: string
}) {
  const meta = getIngredientMeta(name)

  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-stone-200 dark:border-white/5 last:border-0">
      <IngredientThumbnail name={name} size={64} className="rounded-2xl shadow-xs shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] text-stone-900 dark:text-white font-bold truncate capitalize tracking-tight">
            {name}
          </p>
          <span className="text-[10px] font-semibold text-[var(--accent-text-on-light)] bg-[var(--accent)]/12 px-2 py-0.5 rounded-full shrink-0">
            {meta.category}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs font-mono font-medium text-stone-600 dark:text-stone-300">{quantity}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[170px] italic">
            {meta.prepTip}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium tabular-nums text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded-md"
            title="Caloric value"
          >
            <Flame size={11} strokeWidth={2} className="text-amber-500" />
            {meta.calories}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium tabular-nums text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded-md"
            title="Key nutrient"
          >
            <Leaf size={11} strokeWidth={2} className="text-emerald-500" />
            {meta.nutrient}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium tabular-nums text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded-md"
            title="Hydration & Culinary Texture"
          >
            <Droplets size={11} strokeWidth={2} className="text-sky-500" />
            {meta.hydration}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Content ───────────────────────────────────────────────────────────────
function RecipeResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const haptic = useHaptic()
  const { settings } = useSettings()
  const isDark = settings.theme === 'dark'
  const { isSaved, toggleSave } = useSavedRecipes()
  const { isAnonymous, hasDismissedSaveSignIn, openSignInSheet } = useAuth()

  // Parse confirmed ingredients from URL
  const rawIngredients = searchParams.get('ingredients') ?? ''
  const confirmedIngredients = rawIngredients.split(',').map((s) => s.trim()).filter(Boolean)

  // ── State ──
  const [recipe, setRecipe] = useState<AdaptedRecipe | null>(null)
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null)
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [noMoreMatches, setNoMoreMatches] = useState(false)
  const [loadingMatch, setLoadingMatch] = useState(true)
  const [reshuffling, setReshuffling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cookModeOpen, setCookModeOpen] = useState(false)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set())
  const [recipeStack, setRecipeStack] = useState<AdaptedRecipe[]>([])
  const cookRef = useRef<HTMLDivElement>(null)

  // Derived bookmark state synchronized with Saved Recipes store
  const bookmarked = recipe ? isSaved(recipe.id) : false
  const recipeImage = recipe?.image_url ?? (recipe ? pickFoodImage(recipe.id) : '/food/bowl.jpg')

  // ── Match + Adapt ──────────────────────────────────────────────────────────
  const fetchAndAdapt = useCallback(
    async (excludeIds: string[]) => {
      if (confirmedIngredients.length === 0) {
        setError('No ingredients to match.')
        setLoadingMatch(false)
        return
      }

      try {
        setError(null)
        // 1. Match recipes with AI
        const matchRes = await fetch('/api/match-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: confirmedIngredients,
            exclude: excludeIds,
          }),
        })
        const matchData = await matchRes.json()
        const matches: RecipeMatch[] = matchData.recipes ?? []

        // Filter out any recipe matching current or excluded IDs/names
        const remainingMatches = matches.filter(
          (m) => !excludeIds.includes(m.id) && !excludeIds.includes(m.name)
        )

        if (remainingMatches.length === 0) {
          // When all pre-matched candidates are exhausted, generate fresh creative dishes endlessly using AI
          const adaptRes = await fetch('/api/adapt-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipeId: `ai-custom-${Date.now()}`,
              ingredients: confirmedIngredients,
              servings: 2,
              timeConstraint: null,
            }),
          })
          if (adaptRes.ok) {
            const adapted: AdaptedRecipe = await adaptRes.json()
            if (adapted && adapted.id) {
              setRecipe(adapted)
              setCurrentMatchId(adapted.id)
              setNoMoreMatches(false)
              setReshuffling(false)
              setLoadingMatch(false)
              return
            }
          }
          setNoMoreMatches(true)
          setReshuffling(false)
          setLoadingMatch(false)
          return
        }

        const topMatch = remainingMatches[0]
        setCurrentMatchId(topMatch.id)
        setNoMoreMatches(false)

        // ⚡ INSTANT PATH: If topMatch already includes full chef steps from AI generator, render immediately!
        if (topMatch.steps && topMatch.steps.length > 0) {
          const directRecipe: AdaptedRecipe = {
            id: topMatch.id,
            name: topMatch.name,
            category: topMatch.category,
            diet: topMatch.diet,
            time_minutes: topMatch.timeMinutes,
            servings: 2,
            image_url: pickFoodImage(topMatch.id),
            ingredients: topMatch.allIngredients || [],
            steps: topMatch.steps,
            adapted: true,
          }
          setRecipe(directRecipe)
          setLoadingMatch(false)
          setReshuffling(false)
          return
        }

        // 2. Adapt recipe via API if steps were not included
        const adaptRes = await fetch('/api/adapt-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeId: topMatch.id,
            ingredients: confirmedIngredients,
            servings: 2,
            timeConstraint: null,
          }),
        })
        const adapted: AdaptedRecipe = await adaptRes.json()

        if (adapted && adapted.id && Array.isArray(adapted.steps) && adapted.steps.length > 0) {
          setRecipe(adapted)
          setCurrentMatchId(topMatch.id)
          setNoMoreMatches(false)
        } else {
          // Direct fallback recipe
          const fallbackRes = await fetch('/api/adapt-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipeId: `ai-custom-${Date.now()}`,
              ingredients: confirmedIngredients,
              servings: 2,
            }),
          })
          const fallbackAdapted: AdaptedRecipe = await fallbackRes.json()
          setRecipe(fallbackAdapted)
          setCurrentMatchId(fallbackAdapted.id)
          setNoMoreMatches(false)
        }
      } catch (e) {
        try {
          const fallbackRes = await fetch('/api/adapt-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipeId: `ai-custom-${Date.now()}`,
              ingredients: confirmedIngredients,
              servings: 2,
            }),
          })
          const fallbackAdapted: AdaptedRecipe = await fallbackRes.json()
          if (fallbackAdapted && fallbackAdapted.id) {
            setRecipe(fallbackAdapted)
            setCurrentMatchId(fallbackAdapted.id)
            setNoMoreMatches(false)
            return
          }
        } catch {}
        setError(`Could not create recipe: ${String(e)}`)
      } finally {
        setLoadingMatch(false)
        setReshuffling(false)
      }
    },
    [confirmedIngredients]
  )

  // Initial load
  useEffect(() => {
    fetchAndAdapt([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Restore dish from deck stack ──────────────────────────────────────────
  const handleRestoreFromStack = useCallback(
    (stackedRecipe: AdaptedRecipe) => {
      haptic(12)
      if (recipe) {
        setRecipeStack((prev) => [
          recipe,
          ...prev.filter((r) => r.id !== stackedRecipe.id && r.id !== recipe.id),
        ])
      }
      setRecipe(stackedRecipe)
      setCurrentMatchId(stackedRecipe.id)
      setDoneSteps(new Set())
      setActiveStepIndex(0)
    },
    [haptic, recipe]
  )

  // ── Culinary-Themed Reshuffle ("Cook Another Dish") ────────────────────────
  const handleFindAnother = useCallback(async () => {
    if (!currentMatchId || noMoreMatches || reshuffling) return
    haptic([8, 4, 8])

    // Push current recipe to the deck stack underneath
    if (recipe) {
      setRecipeStack((prev) => [recipe, ...prev.filter((r) => r.id !== recipe.id)].slice(0, 3))
    }

    // Track excluded IDs and recipe names so the next match is guaranteed distinct
    const newExcluded = Array.from(
      new Set([...excludedIds, currentMatchId, recipe?.name ?? ''].filter(Boolean))
    )
    setExcludedIds(newExcluded)
    setReshuffling(true)
    setDoneSteps(new Set())
    setActiveStepIndex(0)
    setCookModeOpen(false)
    await fetchAndAdapt(newExcluded)
  }, [currentMatchId, excludedIds, noMoreMatches, reshuffling, haptic, fetchAndAdapt, recipe])

  // ── Bookmark toggle (persists to client store & Supabase) ───────────────────
  const handleBookmark = useCallback(async () => {
    if (!recipe) return
    haptic([12, 8]) // double pulse spring feedback

    // Soft-gate: if anonymous and has not dismissed the sign-in sheet this session, prompt sheet
    const willSave = !isSaved(recipe.id)
    if (willSave && isAnonymous && !hasDismissedSaveSignIn()) {
      openSignInSheet('save')
    }

    // 1. Client saved recipes store synchronization (proceeds either way against user id)
    toggleSave({
      id: recipe.id,
      name: recipe.name,
      image: recipeImage,
      time_minutes: recipe.time_minutes,
      servings: recipe.servings,
      category: recipe.category,
      diet: recipe.diet,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
    })

    // 2. Persist to Supabase endpoint with recipe ID + confirmed ingredients snapshot
    try {
      await fetch('/api/save-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          recipe: {
            ...recipe,
            image_url: recipeImage,
          },
          ingredientsSnapshot: confirmedIngredients,
        }),
      })
    } catch (e) {
      console.warn('[recipe-result] Supabase save notice:', e)
    }
  }, [recipe, toggleSave, isSaved, isAnonymous, hasDismissedSaveSignIn, openSignInSheet, haptic, recipeImage, confirmedIngredients])

  // ── Start Cooking ──────────────────────────────────────────────────────────
  const handleStartCooking = useCallback(() => {
    haptic(15)
    if (recipe && typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(`mise_active_recipe_${recipe.id}`, JSON.stringify(recipe))
      } catch {}
    }
    setCookModeOpen(true)
    setTimeout(() => {
      cookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [haptic, recipe])

  // ── Step done ──────────────────────────────────────────────────────────────
  const markDone = (stepIndex: number) => {
    setDoneSteps((prev) => new Set(Array.from(prev).concat(stepIndex)))
    if (recipe && stepIndex === activeStepIndex) {
      setActiveStepIndex(Math.min(activeStepIndex + 1, recipe.steps.length - 1))
    }
  }

  const bg = 'var(--bg-page)'
  const textPrimary = 'var(--text-primary)'
  const textMuted = 'var(--text-secondary)'

  // ── Rich Culinary Cooking Animation (Replacing Plain White Screen) ────────
  if (loadingMatch) {
    return <CookingAnimation ingredientsCount={confirmedIngredients.length} isDark={isDark} />
  }

  // ── Error / Fallback ───────────────────────────────────────────────────────
  if (error || !recipe) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen px-6 gap-5 text-center"
        style={{ background: bg }}
      >
        <div className="text-5xl">🧑‍🍳</div>
        <p className="text-base font-semibold text-center" style={{ color: textPrimary }}>
          {error ?? 'Ready to cook with your ingredients'}
        </p>
        <p className="text-sm text-center max-w-xs" style={{ color: textMuted }}>
          Craft a delicious chef recipe tailored directly around your {confirmedIngredients.length} scanned items!
        </p>
        <div className="flex flex-col gap-2.5 w-full max-w-xs mt-2">
          <button
            onClick={() => fetchAndAdapt([])}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-[var(--accent)] text-white shadow-md cursor-pointer hover:opacity-90 transition-all"
          >
            <ChefHat size={18} strokeWidth={2} />
            Craft AI Recipe Now
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--text-primary)]"
          >
            ← Scan more ingredients
          </button>
        </div>
      </motion.main>
    )
  }

  // Build petal breakdown representing scanned haul
  const petalData = buildPetalData(confirmedIngredients, recipe.ingredients)
  const groups = groupSteps(recipe.steps)
  const allDone = recipe.steps.length > 0 && doneSteps.size === recipe.steps.length

  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col px-5 pb-44 gap-6 min-h-screen"
      style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
    >
      {/* ── Top bar: Glass circle back + Glass circle bookmark toggle ── */}
      <div className="flex items-center justify-between">
        {/* Back button */}
        <motion.button
          id="result-back-btn"
          whileTap={{ scale: 0.92 }}
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex items-center justify-center w-11 h-11 rounded-full
                     bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs
                     text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </motion.button>

        {/* Bookmark toggle */}
        <motion.button
          id="result-bookmark-btn"
          aria-label={bookmarked ? 'Remove bookmark' : 'Save this result'}
          onClick={handleBookmark}
          whileTap={{ scale: 0.88 }}
          className="flex items-center justify-center w-11 h-11 rounded-full
                     bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs
                     text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ scale: bookmarked ? [1, 1.35, 1] : 1 }}
            transition={{ duration: 0.32, ease: 'backOut' }}
          >
            <Bookmark
              size={20}
              strokeWidth={1.5}
              fill={bookmarked ? 'var(--accent)' : 'none'}
              className={bookmarked ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Sideways Stack Strip: Quick-switch back to previous dishes ── */}
      {recipeStack.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-3 px-1"
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw size={12} className="text-[var(--accent)]" />
              Previous Recipes ({recipeStack.length})
            </span>
            <span className="text-[10px] font-medium text-[var(--accent-text-on-light)]">
              Tap dish to switch back
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {recipeStack.map((stk) => (
              <motion.button
                key={stk.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRestoreFromStack(stk)}
                role="button"
                aria-label={`Switch back to ${stk.name}`}
                className="snap-start shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]/30 hover:border-[var(--accent)] shadow-xs transition-all text-left group cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 bg-[var(--bg-page)] border border-[var(--bg-card-border)] relative">
                  <img
                    src={stk.image_url || pickFoodImage(stk.id)}
                    alt={stk.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col max-w-[150px]">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                    {stk.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                    <Clock size={10} /> {stk.time_minutes}m • ↺ Tap to view
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Petal chart section: Card Stack Deck ── */}
      <div className="relative w-full pt-4 min-h-[500px]">
        {/* Under-stacked card layer 2 (deepest) */}
        {recipeStack.length > 1 && (
          <div
            className="absolute inset-x-5 -top-1 h-36 rounded-[32px] bg-[var(--bg-card)]/40 border border-[var(--bg-card-border)]/40 shadow-xs -z-20 scale-[0.94] rotate-[1.5deg] transition-all duration-300 pointer-events-none"
          />
        )}

        {/* Under-stacked card layer 1 (immediately previous dish, tilted sideways for physical deck feel) */}
        {recipeStack.length > 0 && (
          <motion.div
            initial={{ scale: 1, y: 0, rotate: 0, opacity: 0.9 }}
            animate={{ scale: 0.97, y: -8, rotate: -2, opacity: 0.85 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute inset-x-2 top-0 h-40 rounded-[30px] bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-md -z-10 pointer-events-none"
          />
        )}

        {/* Floating Sideways Quick-Restore Tab (z-30, directly clickable above card) */}
        {recipeStack.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleRestoreFromStack(recipeStack[0])}
            role="button"
            aria-label={`Restore previous dish: ${recipeStack[0].name}`}
            className="absolute -top-1.5 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--accent)] shadow-md text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] cursor-pointer transition-all group"
          >
            <RotateCcw size={12} className="text-[var(--accent)] group-hover:rotate-180 transition-transform" />
            <span className="truncate max-w-[170px]">Back: {recipeStack[0].name}</span>
            <span className="text-[9px] uppercase tracking-wider text-[var(--accent-text-on-light)] font-black bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-full">
              Tap to view
            </span>
          </motion.button>
        )}

        {/* Active Top Recipe Card with Card Stack Animation */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={recipe.id}
            initial={{
              opacity: 0,
              y: -12,
              scale: 0.985,
            }}
            animate={
              reshuffling
                ? {
                    y: 0,
                    scale: [1, 0.993, 1],
                    rotate: 0,
                    opacity: [1, 0.92, 1],
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                    transition: {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
                : {
                    y: 0,
                    scale: 1,
                    rotate: 0,
                    opacity: 1,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 26,
                      mass: 0.85,
                    },
                  }
            }
            exit={{
              opacity: 0,
              scale: 0.98,
              y: 8,
              transition: { duration: 0.16, ease: 'easeOut' },
            }}
            className="w-full relative z-10"
          >
            <GlassCard variant="heavy" className="flex flex-col items-center pt-8 pb-6 px-4 gap-5">
              {/* PetalChart with dish photo in center and reshuffle animation */}
              <PetalChart
                data={petalData}
                centerImage={recipeImage}
                size={260}
                reshuffling={reshuffling}
              />

              {/* Recipe name + stat row */}
              <div className="text-center w-full px-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <h1 className="text-display font-apple text-[var(--text-primary)] font-bold tracking-tight">
                      {recipe.name}
                    </h1>

                    {/* Stat row using StatChip */}
                    <div className="flex items-stretch gap-3 mt-4 px-2">
                      <StatChip
                        icon={<Scale size={14} strokeWidth={1.5} />}
                        value={`${confirmedIngredients.length || recipe.ingredients.length}`}
                        label="Ingredients"
                        iconColor="text-[var(--success)]"
                      />
                      <StatChip
                        icon={<Users size={14} strokeWidth={1.5} />}
                        value={`${recipe.servings}`}
                        label="Servings"
                        iconColor="text-[var(--text-secondary)]"
                      />
                      <StatChip
                        icon={<Clock size={14} strokeWidth={1.5} />}
                        value={`${recipe.time_minutes}m`}
                        label="Cook time"
                        iconColor="text-[var(--accent-text-on-light)]"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Action row directly below name/stats: responsive layout with Previous Recipe button ── */}
              <div className="flex flex-col gap-2 w-full px-1">
                {/* Previous Recipe Quick Swap (if history exists) */}
                {recipeStack.length > 0 && (
                  <motion.button
                    id="result-prev-recipe-btn"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleRestoreFromStack(recipeStack[0])}
                    role="button"
                    aria-label={`Switch back to previous dish: ${recipeStack[0].name}`}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer bg-[var(--accent)]/10 border border-[var(--accent)]/40 hover:border-[var(--accent)] text-[var(--accent-text-on-light)] shadow-xs"
                    style={{ minHeight: '44px' }}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <RotateCcw size={14} className="text-[var(--accent)] shrink-0" />
                      <span className="truncate">
                        Switch back: <strong className="font-bold text-[var(--text-primary)]">{recipeStack[0].name}</strong>
                      </span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">
                      View ↵
                    </span>
                  </motion.button>
                )}

                <div className="flex gap-3 w-full">
                  {/* Save button */}
                  <motion.button
                    id="result-save-btn"
                    whileTap={{ scale: 0.96 }}
                    onClick={handleBookmark}
                    aria-label={bookmarked ? 'Saved' : 'Save this result'}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      background: bookmarked ? 'var(--accent)' : 'var(--bg-card)',
                      border: `1px solid ${bookmarked ? 'var(--accent)' : 'var(--bg-card-border)'}`,
                      color: bookmarked ? 'white' : 'var(--text-primary)',
                      minHeight: '48px',
                    }}
                  >
                    <Bookmark size={16} strokeWidth={bookmarked ? 2.5 : 1.5} fill={bookmarked ? 'white' : 'none'} />
                    {bookmarked ? 'Saved' : 'Save'}
                  </motion.button>

                  {/* Culinary-themed "Cook Another Dish" button */}
                  <motion.button
                    id="result-find-another-btn"
                    whileTap={!noMoreMatches && !reshuffling ? { scale: 0.96 } : undefined}
                    onClick={handleFindAnother}
                    disabled={noMoreMatches || reshuffling}
                    aria-label="Cook another dish"
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer disabled:cursor-default"
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${noMoreMatches ? 'var(--bg-card-border)' : 'var(--accent)'}`,
                      color: noMoreMatches
                        ? 'var(--text-secondary)'
                        : 'var(--accent-text-on-light)',
                      opacity: reshuffling ? 0.7 : noMoreMatches ? 0.5 : 1,
                      minHeight: '48px',
                    }}
                  >
                    <motion.div
                      animate={reshuffling ? { rotate: 360 } : { rotate: 0 }}
                      transition={reshuffling ? { duration: 1.4, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
                    >
                      <ChefHat size={16} strokeWidth={1.8} />
                    </motion.div>
                    {reshuffling ? 'Dealing next dish…' : noMoreMatches ? 'No other dishes' : 'Cook Another Dish'}
                  </motion.button>
                </div>
              </div>

              {/* No other matches inline notice */}
              <AnimatePresence>
                {noMoreMatches && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-center px-3 font-medium text-stone-500 dark:text-stone-400"
                  >
                    No other matches for these ingredients
                  </motion.p>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Ingredients used section ── */}
      <section>
        <div className="section-header flex items-center justify-between mb-2">
          <h2 className="section-title text-stone-900 dark:text-white font-bold text-lg">
            Ingredients used
          </h2>
          <span className="text-label text-stone-400 dark:text-stone-500 text-xs font-medium">
            {confirmedIngredients.length || recipe.ingredients.length} scanned
          </span>
        </div>

        {/* Adaptation notice */}
        <AnimatePresence>
          {!recipe.adapted && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--accent-text-on-light)',
              }}
            >
              <Info size={13} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>Showing standard recipe</span>
              {recipe.adaptationReason ? <span className="opacity-80"> — {recipe.adaptationReason}</span> : null}
            </motion.div>
          )}
        </AnimatePresence>

        <GlassCard className="divide-y divide-[var(--bg-card-border)] overflow-hidden" padding={false}>
          <div className="px-4">
            {(confirmedIngredients.length > 0 ? confirmedIngredients : recipe.ingredients.map((i) => i.name)).map(
              (name, i) => {
                const matchedIng = recipe.ingredients.find((r) => r.name.toLowerCase().includes(name.toLowerCase()))
                return (
                  <IngredientRow
                    key={i}
                    name={name}
                    quantity={matchedIng?.quantity ?? '1 portion'}
                  />
                )
              }
            )}
          </div>
        </GlassCard>
      </section>

      {/* ── Start Cooking CTA / Dynamic Cooking Status Banner ── */}
      {cookModeOpen ? (
        <div className="flex flex-col gap-2">
          <CookingStatusBanner
            currentStepIndex={activeStepIndex}
            totalSteps={recipe.steps.length}
            currentInstruction={recipe.steps[activeStepIndex]?.instruction}
            totalRemainingMinutes={recipe.steps
              .filter((_, idx) => !doneSteps.has(idx))
              .reduce((acc, curr) => acc + (curr.duration_minutes || 2), 0)}
            onClick={() =>
              router.push(
                `/steps/${recipe.id}?ingredients=${encodeURIComponent(rawIngredients)}&servings=2`
              )
            }
          />
          <div className="flex justify-between items-center px-2">
            <span className="text-[11px] text-[var(--text-secondary)]">Tap banner to expand</span>
            <button
              onClick={() =>
                router.push(
                  `/steps/${recipe.id}?ingredients=${encodeURIComponent(rawIngredients)}&servings=2`
                )
              }
              className="text-xs font-semibold text-[var(--accent-text-on-light)] hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              <span>Fullscreen Cooking Mode ↗</span>
            </button>
          </div>
        </div>
      ) : (
        <motion.button
          id="result-start-cooking-btn"
          whileTap={{ scale: 0.98 }}
          onClick={handleStartCooking}
          aria-label="Start cooking"
          className="flex items-center justify-center w-full h-14 rounded-pill
                     font-bold text-label-lg transition-colors shadow-sm cursor-pointer bg-[var(--accent)] text-white hover:opacity-95"
        >
          <ChefHat size={18} strokeWidth={1.5} className="mr-2" />
          Start Cooking
        </motion.button>
      )}

      {/* ── Cook mode (guided interactive journey) ── */}
      <AnimatePresence>
        {cookModeOpen && (
          <motion.section
            ref={cookRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            id="cook-mode-section"
          >
            <div className="section-header flex items-center justify-between mt-3 mb-3">
              <h2 className="section-title text-[var(--text-primary)] font-bold text-lg">
                Cooking Journey
              </h2>
              <span className="text-label text-[var(--text-secondary)] text-xs font-medium">
                {recipe.steps.length} steps
              </span>
            </div>

            {/* Vertical liquid journey timeline */}
            <CookingJourneyTimeline
              steps={recipe.steps}
              activeStepIndex={activeStepIndex}
              doneSteps={doneSteps}
              allIngredients={recipe.ingredients || []}
              onStepSelect={(idx) => setActiveStepIndex(idx)}
              onStepComplete={(idx) => {
                if (doneSteps.has(idx)) {
                  setDoneSteps((prev) => {
                    const n = new Set(Array.from(prev))
                    n.delete(idx)
                    return n
                  })
                } else {
                  markDone(idx)
                }
              }}
              lastCompletedIndex={null}
            />

            {/* Floating Chef Assistant */}
            <div className="mt-3 mb-4">
              <ChefAssistant
                currentStepIndex={activeStepIndex}
                totalSteps={recipe.steps.length}
                instruction={recipe.steps[activeStepIndex]?.instruction}
              />
            </div>

            {/* All-done celebration */}
            <AnimatePresence>
              {allDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'backOut' }}
                  className="mt-6 rounded-3xl p-6 text-center"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bg-card-border)',
                  }}
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h3
                    className="text-title font-bold mb-1"
                    style={{ color: textPrimary }}
                  >
                    All done!
                  </h3>
                  <p className="text-sm mb-4" style={{ color: textMuted }}>
                    Enjoy your {recipe.name}.
                  </p>
                  <button
                    onClick={() =>
                      router.push(
                        `/steps/${recipe.id}?ingredients=${encodeURIComponent(rawIngredients)}&servings=2`
                      )
                    }
                    className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-white font-bold text-xs shadow-sm cursor-pointer hover:opacity-90 transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    <Trophy size={13} className="text-amber-300 fill-amber-300" />
                    <span>View Completion Trophy & Stats</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Substitutions panel (if adapted) */}
      {recipe.adapted && recipe.substitutions && recipe.substitutions.length > 0 && (
        <GlassCard variant="subtle" className="mt-1">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} strokeWidth={2} style={{ color: 'var(--accent)' }} />
            <span className="text-label font-semibold" style={{ color: 'var(--accent-text-on-light)' }}>
              Substitutions made
            </span>
          </div>
          {recipe.substitutions.map((s, i) => (
            <div key={i} className="flex items-baseline gap-2 text-xs mb-1 last:mb-0">
              <span className="text-[var(--text-secondary)] line-through">{s.original}</span>
              <span className="text-[var(--accent)] font-medium">→ {s.substitute}</span>
              {s.note && <span className="text-[var(--text-secondary)]">({s.note})</span>}
            </div>
          ))}
        </GlassCard>
      )}
    </motion.main>
  )
}

// ─── Page export with Suspense ───────────────────────────────────────────────────
export default function RecipeResultPage() {
  return (
    <Suspense fallback={<CookingAnimation />}>
      <RecipeResultContent />
    </Suspense>
  )
}
