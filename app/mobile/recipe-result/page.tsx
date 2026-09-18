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
} from 'lucide-react'
import Image from 'next/image'
import { GlassCard } from '@/components/GlassCard'
import { PetalChart } from '@/components/PetalChart'
import { StatChip } from '@/components/StatChip'
import { FloatingNav } from '@/components/FloatingNav'
import { CookingAnimation } from '@/components/CookingAnimation'
import IngredientThumbnail from '@/components/IngredientThumbnail'
import { useHaptic } from '@/lib/useHaptic'
import { useSavedRecipes } from '@/lib/useSavedRecipes'
import { useSettings } from '@/lib/useSettings'

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
          background: isUrgent ? 'rgba(239,68,68,0.14)' : 'rgba(217,164,65,0.12)',
          color: isUrgent ? '#ef4444' : '#D9A441',
          border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(217,164,65,0.25)'}`,
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
          background: running ? 'rgba(239,68,68,0.1)' : 'rgba(62,74,42,0.08)',
          color: running ? '#ef4444' : '#6E7F4A',
          border: `1px solid ${running ? 'rgba(239,68,68,0.2)' : 'rgba(62,74,42,0.12)'}`,
        }}
      >
        {running ? '⏸ Pause' : isDone ? 'Done' : '▶ Start'}
      </button>
      <button
        onClick={reset}
        className="text-xs px-2 py-1 rounded-full font-medium transition-all cursor-pointer"
        style={{ background: 'rgba(0,0,0,0.04)', color: '#9ca3af' }}
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
        background: isActive
          ? isDark ? 'rgba(217,164,65,0.12)' : 'rgba(217,164,65,0.08)'
          : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
        border: `1px solid ${isActive
          ? 'rgba(217,164,65,0.35)'
          : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
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
            background: isActive ? '#D9A441' : isDone ? '#6E7F4A' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            color: isActive || isDone ? (isDark ? '#1e1e1e' : 'white') : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
          }}
        >
          {isDone ? '✓' : index + 1}
        </div>

        <div className="flex-1">
          <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#292524' }}>
            {step.instruction}
          </p>

          {step.duration_minutes && step.duration_minutes > 0 && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
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
  return (
    <div className="flex items-center gap-3.5 py-3 border-b border-stone-200 dark:border-white/5 last:border-0">
      <IngredientThumbnail name={name} size={64} className="rounded-xl shadow-xs" />

      <div className="flex-1 min-w-0">
        <p className="text-label-lg text-stone-900 dark:text-white font-semibold truncate capitalize">
          {name}
        </p>
        <p className="text-label font-mono text-stone-500 dark:text-stone-400 mt-0.5">{quantity}</p>
        <div className="flex gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] font-medium tabular-nums text-stone-600 dark:text-stone-400">
            <Leaf size={10} strokeWidth={1.5} className="text-olive-500" />
            —
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium tabular-nums text-saffron-400">
            <Droplets size={10} strokeWidth={1.5} />
            —
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium tabular-nums text-red-400">
            <Flame size={10} strokeWidth={1.5} />
            —
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
          // Try fallback direct adaptation before marking no matches
          if (excludeIds.length === 0) {
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
                return
              }
            }
          }
          setNoMoreMatches(true)
          setReshuffling(false)
          setLoadingMatch(false)
          return
        }

        const topMatch = remainingMatches[0]
        setCurrentMatchId(topMatch.id)
        setNoMoreMatches(remainingMatches.length <= 1)

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

  // ── Culinary-Themed Reshuffle ("Cook Another Dish") ────────────────────────
  const handleFindAnother = useCallback(async () => {
    if (!currentMatchId || noMoreMatches || reshuffling) return
    haptic([8, 4, 8])
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
  }, [currentMatchId, excludedIds, noMoreMatches, reshuffling, haptic, fetchAndAdapt, recipe?.name])

  // ── Bookmark toggle (persists to client store & Supabase) ───────────────────
  const handleBookmark = useCallback(async () => {
    if (!recipe) return
    haptic([12, 8]) // double pulse spring feedback

    // 1. Client saved recipes store synchronization
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
  }, [recipe, toggleSave, haptic, recipeImage, confirmedIngredients])

  // ── Start Cooking ──────────────────────────────────────────────────────────
  const handleStartCooking = useCallback(() => {
    haptic(15)
    setCookModeOpen(true)
    setTimeout(() => {
      cookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [haptic])

  // ── Step done ──────────────────────────────────────────────────────────────
  const markDone = (stepIndex: number) => {
    setDoneSteps((prev) => new Set(Array.from(prev).concat(stepIndex)))
    if (recipe && stepIndex === activeStepIndex) {
      setActiveStepIndex(Math.min(activeStepIndex + 1, recipe.steps.length - 1))
    }
  }

  const bg = isDark ? '#0f0f0f' : '#faf8f5'
  const textPrimary = isDark ? '#ffffff' : '#1c1917'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'

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
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-[#D9A441] text-stone-950 shadow-md cursor-pointer hover:bg-[#c99534] transition-all"
          >
            <ChefHat size={18} strokeWidth={2} />
            Craft AI Recipe Now
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              color: textPrimary,
            }}
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
                     bg-white/80 dark:bg-[#2c2c2c]/90 backdrop-blur-glass border border-white/60 dark:border-white/10 shadow-glass-sm
                     text-stone-700 dark:text-stone-100 transition-colors cursor-pointer"
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
                     bg-white/80 dark:bg-[#2c2c2c]/90 backdrop-blur-glass border border-white/60 dark:border-white/10 shadow-glass-sm
                     text-stone-700 dark:text-stone-100 transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ scale: bookmarked ? [1, 1.35, 1] : 1 }}
            transition={{ duration: 0.32, ease: 'backOut' }}
          >
            <Bookmark
              size={20}
              strokeWidth={1.5}
              fill={bookmarked ? '#ffa371' : 'none'}
              className={bookmarked ? 'text-[#ffa371]' : 'text-stone-600 dark:text-stone-300'}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Petal chart section (inside a <GlassCard>) ── */}
      <GlassCard variant="heavy" className="flex flex-col items-center py-6 gap-5">
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
              <h1 className="text-display font-apple text-stone-900 dark:text-white font-bold tracking-tight">
                {recipe.name}
              </h1>

              {/* Stat row using StatChip */}
              <div className="flex items-stretch gap-3 mt-4 px-2">
                <StatChip
                  icon={<Scale size={14} strokeWidth={1.5} />}
                  value={`${confirmedIngredients.length || recipe.ingredients.length}`}
                  label="Ingredients"
                  iconColor="text-olive-500"
                />
                <StatChip
                  icon={<Users size={14} strokeWidth={1.5} />}
                  value={`${recipe.servings}`}
                  label="Servings"
                  iconColor="text-stone-500"
                />
                <StatChip
                  icon={<Clock size={14} strokeWidth={1.5} />}
                  value={`${recipe.time_minutes}m`}
                  label="Cook time"
                  iconColor="text-saffron-400"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Action row directly below name/stats, two buttons side by side ── */}
        <div className="flex gap-3 w-full px-1">
          {/* Save button */}
          <motion.button
            id="result-save-btn"
            whileTap={{ scale: 0.96 }}
            onClick={handleBookmark}
            aria-label={bookmarked ? 'Saved' : 'Save this result'}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: bookmarked
                ? isDark ? 'rgba(255,163,113,0.18)' : 'rgba(255,163,113,0.12)'
                : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${bookmarked ? 'rgba(255,163,113,0.35)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              color: bookmarked ? '#ffa371' : isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
            }}
          >
            <Bookmark size={16} strokeWidth={bookmarked ? 2.5 : 1.5} fill={bookmarked ? '#ffa371' : 'none'} />
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
              background: noMoreMatches
                ? isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                : isDark ? 'rgba(217,164,65,0.14)' : 'rgba(217,164,65,0.11)',
              border: `1px solid ${noMoreMatches
                ? isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
                : 'rgba(217,164,65,0.3)'}`,
              color: noMoreMatches
                ? isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
                : '#D9A441',
              opacity: reshuffling ? 0.7 : 1,
            }}
          >
            <motion.div
              animate={reshuffling ? { rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] } : { rotate: 0 }}
              transition={reshuffling ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
            >
              <ChefHat size={16} strokeWidth={1.8} />
            </motion.div>
            {reshuffling ? 'Simmering next dish…' : noMoreMatches ? 'No other dishes' : 'Cook Another Dish'}
          </motion.button>
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
                background: 'rgba(217,164,65,0.09)',
                border: '1px solid rgba(217,164,65,0.22)',
                color: '#B8842A',
              }}
            >
              <Info size={13} strokeWidth={2} style={{ color: '#D9A441', flexShrink: 0 }} />
              <span>Showing standard recipe</span>
              {recipe.adaptationReason ? <span className="opacity-80"> — {recipe.adaptationReason}</span> : null}
            </motion.div>
          )}
        </AnimatePresence>

        <GlassCard className="divide-y divide-stone-100 dark:divide-white/5 overflow-hidden" padding={false}>
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

      {/* ── Start Cooking CTA (Full width, visually most prominent) ── */}
      <motion.button
        id="result-start-cooking-btn"
        whileTap={{ scale: 0.98 }}
        onClick={cookModeOpen ? undefined : handleStartCooking}
        aria-label="Start cooking"
        className="flex items-center justify-center w-full h-14 rounded-pill
                   font-bold text-label-lg transition-colors shadow-glass-heavy cursor-pointer"
        style={{
          background: cookModeOpen
            ? isDark ? '#6E7F4A' : '#4A5830'
            : isDark ? '#ffa371' : '#1c1917',
          color: cookModeOpen ? 'white' : isDark ? '#2c2c2c' : 'white',
        }}
      >
        {cookModeOpen ? (
          <>
            <CheckCircle2 size={18} strokeWidth={1.5} className="mr-2" />
            Cooking in progress
          </>
        ) : (
          <>
            <ChefHat size={18} strokeWidth={1.5} className="mr-2" />
            Start Cooking
          </>
        )}
      </motion.button>

      {/* ── Cook mode (inline timed step view) ── */}
      <AnimatePresence>
        {cookModeOpen && (
          <motion.section
            ref={cookRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            id="cook-mode-section"
          >
            <div className="section-header flex items-center justify-between mt-2 mb-3">
              <h2 className="section-title text-stone-900 dark:text-white font-bold text-lg">
                Steps
              </h2>
              <span className="text-label text-stone-400 dark:text-stone-500 text-xs font-medium">
                {recipe.steps.length} steps
              </span>
            </div>

            {/* Vertical timeline */}
            <div className="relative">
              <div
                className="absolute left-[13px] top-6 bottom-6 w-px pointer-events-none"
                style={{
                  background: isDark
                    ? 'linear-gradient(to bottom, rgba(255,255,255,0.07), rgba(255,255,255,0.03))'
                    : 'linear-gradient(to bottom, rgba(0,0,0,0.07), rgba(0,0,0,0.03))',
                }}
              />

              <div className="flex flex-col gap-3">
                {groups.map((group, gIdx) => {
                  if (Array.isArray(group)) {
                    // Parallel steps grouped side by side
                    return (
                      <div key={gIdx} className="pl-8">
                        <div
                          className="rounded-2xl p-3 mb-2"
                          style={{
                            background: isDark ? 'rgba(217,164,65,0.06)' : 'rgba(217,164,65,0.05)',
                            border: '1px solid rgba(217,164,65,0.18)',
                          }}
                        >
                          <p
                            className="text-[11px] font-semibold tracking-wider uppercase mb-3"
                            style={{ color: '#D9A441' }}
                          >
                            ⚡ Do these at the same time
                          </p>
                          <div className="flex flex-col gap-2">
                            {group.map((step) => {
                              const globalIdx = recipe.steps.findIndex((s) => s.id === step.id)
                              return (
                                <StepCard
                                  key={step.id}
                                  step={step}
                                  index={globalIdx}
                                  isActive={activeStepIndex === globalIdx}
                                  isDone={doneSteps.has(globalIdx)}
                                  onClick={() => {
                                    if (doneSteps.has(globalIdx)) {
                                      setDoneSteps((prev) => {
                                        const n = new Set(Array.from(prev))
                                        n.delete(globalIdx)
                                        return n
                                      })
                                    } else {
                                      markDone(globalIdx)
                                    }
                                  }}
                                />
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Single step
                  const globalIdx = recipe.steps.findIndex((s) => s.id === group.id)
                  return (
                    <div key={group.id} className="flex gap-2 items-start">
                      <div
                        className="flex-shrink-0 w-[9px] h-[9px] rounded-full mt-4 ml-[9px] transition-all duration-200"
                        style={{
                          background: doneSteps.has(globalIdx)
                            ? '#6E7F4A'
                            : activeStepIndex === globalIdx
                            ? '#D9A441'
                            : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                          boxShadow: activeStepIndex === globalIdx
                            ? '0 0 0 3px rgba(217,164,65,0.2)'
                            : 'none',
                        }}
                      />
                      <div className="flex-1">
                        <StepCard
                          step={group}
                          index={globalIdx}
                          isActive={activeStepIndex === globalIdx}
                          isDone={doneSteps.has(globalIdx)}
                          onClick={() => {
                            if (doneSteps.has(globalIdx)) {
                              setDoneSteps((prev) => {
                                const n = new Set(Array.from(prev))
                                n.delete(globalIdx)
                                return n
                              })
                            } else {
                              setActiveStepIndex(globalIdx)
                              markDone(globalIdx)
                            }
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
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
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(110,127,74,0.15) 0%, rgba(217,164,65,0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(110,127,74,0.08) 0%, rgba(217,164,65,0.06) 100%)',
                    border: '1px solid rgba(110,127,74,0.2)',
                  }}
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h3
                    className="text-title font-bold mb-1"
                    style={{ color: textPrimary }}
                  >
                    All done!
                  </h3>
                  <p className="text-sm" style={{ color: textMuted }}>
                    Enjoy your {recipe.name}.
                  </p>
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
            <AlertCircle size={14} strokeWidth={2} style={{ color: '#D9A441' }} />
            <span className="text-label font-semibold" style={{ color: '#B8842A' }}>
              Substitutions made
            </span>
          </div>
          {recipe.substitutions.map((s, i) => (
            <div key={i} className="flex items-baseline gap-2 text-xs mb-1 last:mb-0">
              <span className="text-stone-400 dark:text-stone-500 line-through">{s.original}</span>
              <span className="text-[#D9A441] font-medium">→ {s.substitute}</span>
              {s.note && <span className="text-stone-400 dark:text-stone-500">({s.note})</span>}
            </div>
          ))}
        </GlassCard>
      )}

      {/* ── Fixed Floating Navigation ── */}
      <FloatingNav />
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
