'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, Clock, Users, Leaf, Droplets, Flame } from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { PetalChart } from '@/components/PetalChart'
import IngredientThumbnail from '@/components/IngredientThumbnail'
import { useHaptic } from '@/lib/useHaptic'
import { useSavedRecipes } from '@/lib/useSavedRecipes'
import { useAuth } from '@/lib/useAuth'
import { getIngredientMeta } from '@/lib/ingredientDetails'
import { REGIONAL_RECIPES } from '@/lib/regionalRecipes'

// ── Screen 3: Result Detail ────────────────────────────────────────
export default function DetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const haptic = useHaptic()
  const { isSaved, toggleSave, getSavedRecipe } = useSavedRecipes()
  const { isAnonymous, hasDismissedSaveSignIn, openSignInSheet } = useAuth()

  const savedRecipe = getSavedRecipe(params.id)
  const bookmarked = isSaved(params.id)

  const detail = useMemo(() => {
    if (savedRecipe) {
      const ingList = savedRecipe.ingredients || []
      const equalPetal = Math.max(10, Math.round(100 / Math.max(1, ingList.length)))
      return {
        id: savedRecipe.id,
        name: savedRecipe.name,
        weight: savedRecipe.calories ? `${savedRecipe.calories} kcal` : `${savedRecipe.time} mins`,
        servings: savedRecipe.servings || 2,
        time: savedRecipe.time,
        image: savedRecipe.image,
        heroImage: savedRecipe.image,
        petalData: ingList.length > 0
          ? ingList.map((i) => ({
              label: i.name.split(' ')[0] || i.name,
              value: equalPetal,
            }))
          : [{ label: 'Fresh', value: 100 }],
        ingredients: ingList.map((i) => ({
          name: i.name,
          image: savedRecipe.image,
          quantity: i.quantity,
          chips: [
            { icon: <Leaf size={12} strokeWidth={1.5} />, value: 'Fresh', label: 'Produce', iconColor: 'text-stone-600' },
            { icon: <Droplets size={12} strokeWidth={1.5} />, value: i.optional ? 'Optional' : 'Essential', label: 'Ingredient', iconColor: 'text-[var(--accent-text-on-light)]' },
          ],
        })),
        steps: savedRecipe.steps,
      }
    }

    // Check if dish is a curated regional recipe
    const regional = REGIONAL_RECIPES.find((r) => r.id === params.id)
    if (regional) {
      const ingList = regional.ingredients || []
      const equalPetal = Math.max(10, Math.round(100 / Math.max(1, ingList.length)))
      return {
        id: regional.id,
        name: regional.name,
        regionalName: regional.regionalName,
        weight: `${regional.time} mins`,
        servings: 2,
        time: regional.time,
        image: regional.image,
        heroImage: regional.image,
        petalData: ingList.map((i) => ({
          label: i.name.split(' ')[0] || i.name,
          value: equalPetal,
        })),
        ingredients: ingList.map((i) => ({
          name: i.name,
          image: regional.image,
          quantity: i.quantity,
          chips: [
            { icon: <Leaf size={12} strokeWidth={1.5} />, value: 'Fresh', label: 'Produce', iconColor: 'text-stone-600' },
            { icon: <Droplets size={12} strokeWidth={1.5} />, value: i.optional ? 'Optional' : 'Essential', label: 'Ingredient', iconColor: 'text-[var(--accent-text-on-light)]' },
          ],
        })),
        steps: regional.steps.map((s) => ({
          id: s.id,
          step_order: s.step_order,
          instruction: s.instruction,
          duration_minutes: s.duration_minutes,
          parallel: s.parallel || false,
        })),
      }
    }

    // Dynamic clean fallback
    const title = params.id
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    return {
      id: params.id,
      name: title || 'Curated Dish',
      weight: '15 mins',
      servings: 2,
      time: 15,
      image: '/food/pasta.jpg',
      heroImage: '/food/pasta.jpg',
      petalData: [{ label: 'Fresh', value: 100 }],
      ingredients: [
        {
          name: 'Main Culinary Items',
          image: '/food/pasta.jpg',
          quantity: 'Portioned to taste',
          chips: [
            { icon: <Leaf size={12} strokeWidth={1.5} />, value: 'Fresh', label: 'Item', iconColor: 'text-stone-600' },
            { icon: <Droplets size={12} strokeWidth={1.5} />, value: 'Essential', label: 'Base', iconColor: 'text-[var(--accent-text-on-light)]' },
          ],
        },
      ],
      steps: [],
    }
  }, [savedRecipe, params.id])

  const handleBookmark = () => {
    haptic([12, 8])
    if (!bookmarked && isAnonymous && !hasDismissedSaveSignIn()) {
      openSignInSheet('save')
    }

    if (savedRecipe) {
      toggleSave(savedRecipe)
    } else {
      toggleSave({
        id: detail.id,
        name: detail.name,
        image: detail.heroImage,
        time: 25,
        servings: detail.servings,
      })
    }
  }

  const ingParams = encodeURIComponent(detail.ingredients.map((i) => i.name).join(','))
  const cookingHref = `/steps/${detail.id}?ingredients=${ingParams}&servings=${detail.servings}`

  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col px-5 pb-44 gap-6 min-h-screen max-w-mobile mx-auto"
      style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between pt-4">
        {/* Back */}
        <motion.div whileTap={{ scale: 0.92 }}>
          <button
            onClick={() => router.back()}
            id="back-btn"
            aria-label="Go back"
            className="flex items-center justify-center w-11 h-11 rounded-full
                       bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs
                       text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
        </motion.div>

        {/* Bookmark */}
        <motion.button
          id="bookmark-btn"
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          onClick={handleBookmark}
          whileTap={{ scale: 0.88 }}
          className="flex items-center justify-center w-11 h-11 rounded-full
                     bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs
                     text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ scale: bookmarked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
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

      {/* ── Petal chart ── */}
      <GlassCard variant="heavy" className="flex flex-col items-center pt-8 pb-6 px-4">
        <PetalChart
          data={detail.petalData}
          centerImage={detail.heroImage}
          size={260}
        />

        {/* Name + info below chart */}
        <div className="text-center mt-4 px-2">
          <h1 className="text-display font-apple text-[var(--text-primary)] font-bold tracking-tight">{detail.name}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 text-label">
              <span className="font-medium font-mono text-[var(--text-primary)]">{detail.weight}</span>
            </span>
            <span className="w-px h-4 bg-[var(--bg-card-border)]" />
            <span className="flex items-center gap-1.5 text-label">
              <Users size={14} strokeWidth={1.5} />
              <span className="font-medium text-[var(--text-primary)]">{detail.servings} servings</span>
            </span>
          </div>
        </div>
      </GlassCard>

      {/* ── Ingredient list ── */}
      <section>
        <div className="section-header mb-3 flex items-center justify-between">
          <h2 className="section-title text-[var(--text-primary)] font-bold text-lg">Ingredients</h2>
          <span className="text-sm font-medium text-[var(--text-secondary)]">{detail.ingredients.length} items</span>
        </div>
        <GlassCard className="divide-y divide-[var(--bg-card-border)] overflow-hidden" padding={false}>
          <div className="px-4">
            {detail.ingredients.map((ing, i) => {
              const meta = getIngredientMeta(ing.name)
              return (
                <div key={i} className="flex items-center gap-3.5 py-3.5 border-b border-[var(--bg-card-border)] last:border-0">
                  <IngredientThumbnail name={ing.name} size={64} className="rounded-2xl shadow-xs shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] text-[var(--text-primary)] font-bold truncate capitalize tracking-tight">
                        {ing.name}
                      </p>
                      <span className="text-[10px] font-semibold text-[var(--accent-text-on-light)] bg-[var(--accent)]/12 px-2 py-0.5 rounded-full shrink-0">
                        {meta.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs font-mono font-medium text-[var(--text-secondary)]">{ing.quantity}</p>
                      <span className="text-[11px] text-[var(--text-secondary)]/80 truncate max-w-[170px] italic">
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
            })}
          </div>
        </GlassCard>
      </section>

      {/* ── CTA ── */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <Link
          href={cookingHref}
          id="start-cooking-btn"
          className="flex items-center justify-center w-full h-14 rounded-pill
                     bg-[var(--accent)] text-white font-bold text-label-lg
                     hover:opacity-95 transition-opacity shadow-sm"
        >
          <Clock size={18} strokeWidth={1.5} className="mr-2" />
          Start Cooking
        </Link>
      </motion.div>
    </motion.main>
  )
}
