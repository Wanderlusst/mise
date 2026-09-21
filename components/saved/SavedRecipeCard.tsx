'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock,
  Heart,
  ChefHat,
  Zap,
  RotateCcw,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Trophy,
  UtensilsCrossed,
  Star,
} from 'lucide-react'
import {
  type SavedRecipe,
  computeRecipeCookingInsight,
} from '@/lib/useSavedRecipes'
import { useHaptic } from '@/lib/useHaptic'

// ─── Luxury Badge Component ───────────────────────────────────────────────────
function RecipeBadgePill({ badge }: { badge: NonNullable<SavedRecipe['badge']> }) {
  const configs: Record<
    NonNullable<SavedRecipe['badge']>,
    { text: string; icon: React.ReactNode }
  > = {
    Trending: {
      text: 'Trending',
      icon: <Flame size={11} strokeWidth={2.4} className="text-[var(--accent)]" />,
    },
    'Most Cooked': {
      text: 'Most Cooked',
      icon: <Trophy size={11} strokeWidth={2.2} className="text-[var(--accent)]" />,
    },
    Favorite: {
      text: 'Favorite',
      icon: <Heart size={11} strokeWidth={2.4} className="text-[var(--accent)]" />,
    },
    New: {
      text: 'New Recipe',
      icon: <Zap size={11} strokeWidth={2.2} className="text-[var(--accent)]" />,
    },
    'Chef Pick': {
      text: 'Chef Pick',
      icon: <ChefHat size={11} strokeWidth={2.2} className="text-[var(--accent)]" />,
    },
  }

  const config = configs[badge] || configs.Trending

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight bg-[var(--bg-card)] text-[var(--accent-text-on-light)] border border-[var(--bg-card-border)]"
    >
      {config.icon}
      {config.text}
    </span>
  )
}

// ─── Saved Recipe Card Component ──────────────────────────────────────────────
interface SavedRecipeCardProps {
  recipe: SavedRecipe
  pantryItems?: string[]
  onUnsave: (id: string) => void
  onToggleFavorite?: (id: string) => void
}

export function SavedRecipeCard({
  recipe,
  pantryItems = [],
  onUnsave,
  onToggleFavorite,
}: SavedRecipeCardProps) {
  const router = useRouter()
  const haptic = useHaptic()
  const [heartPop, setHeartPop] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Smart Cooking Insight
  const insight = computeRecipeCookingInsight(recipe, pantryItems)

  const handleUnsaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptic(14)
    setHeartPop(true)
    setTimeout(() => {
      onUnsave(recipe.id)
    }, 280)
  }

  const handleStartCooking = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptic(12)
    const ingParams = encodeURIComponent(
      (recipe.ingredients || []).map((i) => i.name).join(',')
    )
    router.push(`/steps/${recipe.id}?ingredients=${ingParams}&servings=${recipe.servings || 2}`)
  }

  const totalIngredients = recipe.ingredients ? recipe.ingredients.length : 6
  const timesCooked = recipe.timesCooked || 0
  const hasCookedBefore = timesCooked > 0

  return (
    <article className="group w-full select-none">
      <div
        className="w-full rounded-[30px] overflow-hidden transition-all duration-300
                   bg-[var(--bg-card)] border border-[var(--bg-card-border)]"
      >
        {/* ── Card Header (Title & Memory Info) ── */}
        <div className="flex items-start justify-between px-5 pt-4.5 pb-2.5">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1">
              {recipe.badge && <RecipeBadgePill badge={recipe.badge} />}
              {recipe.bestRecordTime && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)]">
                  <Trophy size={11} className="text-[var(--accent-text-on-light)]" />
                  {recipe.bestRecordTime}
                </span>
              )}
            </div>

            <Link href={`/mobile/detail/${recipe.id}`} className="block">
              <h3 className="text-[20px] font-bold text-[var(--text-primary)] leading-snug tracking-tight font-apple hover:text-[var(--accent)] transition-colors">
                {recipe.name}
              </h3>
            </Link>

            {/* Kitchen Memory Subline */}
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5 font-medium">
              {recipe.lastCooked ? (
                <span>Cooked {recipe.lastCooked}</span>
              ) : (
                <span>Ready to explore</span>
              )}
              <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/30" />
              <span>{hasCookedBefore ? `Cooked ${timesCooked} times` : 'New in cookbook'}</span>
            </p>
          </div>

          {/* Luxury Heart Bookmark Button */}
          <motion.button
            id={`unsave-${recipe.id}`}
            aria-label={`Bookmark ${recipe.name}`}
            onClick={handleUnsaveClick}
            animate={heartPop ? { scale: [1, 1.45, 0.85, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            whileTap={{ scale: 0.85 }}
            className="w-10 h-10 rounded-full flex items-center justify-center outline-none flex-shrink-0 cursor-pointer
                       bg-[var(--bg-card)] border border-[var(--bg-card-border)]
                       text-[var(--accent)] hover:scale-105 transition-transform"
          >
            <Heart
              size={19}
              className="fill-[var(--accent)] text-[var(--accent)] transition-colors"
              strokeWidth={1.5}
            />
          </motion.button>
        </div>

        {/* ── Large Hero Cover Image ── */}
        <Link href={`/mobile/detail/${recipe.id}`} className="block">
          <div className="relative mx-3.5 h-[215px] sm:h-[235px] rounded-[22px] overflow-hidden bg-stone-100 dark:bg-stone-800">
            {/* Image zoom effect */}
            <motion.div
              className="w-full h-full relative"
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <Image
                src={recipe.image}
                alt={recipe.name}
                fill
                priority={false}
                onLoad={() => setImageLoaded(true)}
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 440px) 100vw, 420px"
              />

              {/* Subtle gradient vignette for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
            </motion.div>

            {/* Top-Left Floating Time Chip */}
            <div className="absolute top-3 left-3 z-10">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[12px] font-bold tracking-tight
                           backdrop-blur-md border border-white/25 shadow-sm"
                style={{ background: 'rgba(0, 0, 0, 0.45)' }}
              >
                <Clock size={13} strokeWidth={2.2} className="text-[var(--accent)]" />
                <span>{recipe.time} min</span>
              </div>
            </div>

            {/* Bottom Smart Cooking Insight Chip */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold tracking-tight
                           backdrop-blur-md shadow-md border"
                style={{
                  background: insight.isReadyToCook
                    ? 'var(--success-bg)'
                    : 'rgba(24, 24, 27, 0.78)',
                  borderColor: insight.isReadyToCook
                    ? 'var(--success)'
                    : 'rgba(255, 255, 255, 0.18)',
                  color: insight.isReadyToCook ? 'var(--success)' : 'white',
                }}
              >
                {insight.isReadyToCook ? (
                  <CheckCircle2 size={13} strokeWidth={2.4} className="text-[var(--success)]" />
                ) : (
                  <AlertCircle size={13} strokeWidth={2.2} className="text-[var(--accent)]" />
                )}
                <span>{insight.badgeText}</span>
              </div>

              {/* Sub-label showing missing ingredients or comfort note */}
              <span className="text-[11px] font-medium text-white/90 drop-shadow-md bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                {insight.subtext}
              </span>
            </div>
          </div>
        </Link>

        {/* ── Recipe Information Row (No calories, purely cooking metrics) ── */}
        <div className="px-5 pt-3.5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[13px] text-[var(--text-secondary)] font-medium">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[var(--accent-text-on-light)]" />
              <span>{recipe.time} min</span>
            </span>

            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/30" />

            <span className="flex items-center gap-1.5">
              <UtensilsCrossed size={13} className="text-[var(--accent-text-on-light)]" />
              <span>{totalIngredients} Ingredients</span>
            </span>

            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/30" />

            <span className="flex items-center gap-1.5">
              <Star size={13} className="text-[var(--accent-text-on-light)]" />
              <span>{hasCookedBefore ? `${timesCooked} cooked` : 'To Cook'}</span>
            </span>
          </div>
        </div>

        {/* ── Primary Action CTA ── */}
        <div className="px-4 pb-4 pt-1.5">
          <motion.button
            id={`cook-cta-${recipe.id}`}
            onClick={handleStartCooking}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            className="w-full h-[48px] rounded-[18px] flex items-center justify-center gap-2.5
                       font-apple font-bold text-[15px] text-white cursor-pointer outline-none select-none
                       transition-all duration-200 bg-[var(--accent)] shadow-sm hover:opacity-95"
          >
            {hasCookedBefore ? (
              <>
                <RotateCcw size={16} strokeWidth={2.4} />
                <span>Cook Again</span>
              </>
            ) : (
              <>
                <ChefHat size={17} strokeWidth={2.2} className="text-white" />
                <span>Start Cooking</span>
              </>
            )}
            <ArrowRight size={15} strokeWidth={2.2} className="opacity-80 ml-0.5" />
          </motion.button>
        </div>
      </div>
    </article>
  )
}
