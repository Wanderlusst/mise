'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Sparkles,
  Heart,
  Play,
  RotateCw,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Flame,
  ChefHat,
} from 'lucide-react'
import { RecipeCardData } from '@/lib/chefMiseEngine'
import { useSavedRecipes } from '@/lib/useSavedRecipes'
import { useHaptic } from '@/lib/useHaptic'

interface RecipeResponseCardProps {
  recipe: RecipeCardData
  onAlternative?: () => void
}

export function RecipeResponseCard({ recipe, onAlternative }: RecipeResponseCardProps) {
  const [showSteps, setShowSteps] = useState(false)
  const { isSaved, toggleSave } = useSavedRecipes()
  const haptic = useHaptic()
  const saved = isSaved(recipe.id)

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptic(15)
    toggleSave({
      id: recipe.id,
      name: recipe.name,
      image: recipe.image,
      time: recipe.time,
      difficulty: recipe.difficulty,
      calories: recipe.calories,
      diet: recipe.diet,
      servings: recipe.servings,
      ingredients: recipe.haveIngredients.map((name) => ({ name, quantity: 'to taste' })),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mt-3 overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] transition-all"
    >
      {/* ── Recipe Hero Image with Overlay Badges ── */}
      <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        <Image
          src={recipe.image}
          alt={recipe.name}
          fill
          sizes="(max-width: 430px) 100vw, 400px"
          className="object-cover object-center transition-transform duration-500 hover:scale-105"
        />

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10.5px] font-semibold">
            <Sparkles size={11} className="text-[var(--accent)]" />
            Chef Match
          </span>

          <button
            onClick={handleSaveToggle}
            aria-label={saved ? 'Unsave recipe' : 'Save recipe'}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-stone-800 dark:text-white hover:scale-110 active:scale-95 transition-transform shadow-xs"
          >
            <Heart
              size={15}
              className={saved ? 'fill-rose-500 text-rose-500' : 'text-stone-700 dark:text-stone-200'}
            />
          </button>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 inset-x-3.5 text-white">
          <div className="flex items-center gap-2 text-[10.5px] font-medium text-white/80 mb-0.5">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {recipe.time} mins
            </span>
            <span>•</span>
            <span>{recipe.difficulty}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5">
              <Flame size={11} className="text-[var(--accent)]" /> {recipe.calories} kcal
            </span>
          </div>
          <h3 className="text-[17px] font-bold tracking-tight text-white leading-snug drop-shadow-xs">
            {recipe.name}
          </h3>
        </div>
      </div>

      {/* ── Key Culinary Stats: You Have X/Y & Missing Alert ── */}
      <div className="p-4 space-y-3">
        {/* Ingredient Match Bar */}
        <div className="p-2.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] flex items-center justify-center font-bold text-xs">
              {recipe.ingredientsHave}/{recipe.ingredientsTotal}
            </div>
            <div>
              <p className="text-[11.5px] font-bold text-[var(--text-primary)]">
                You Have {recipe.ingredientsHave} of {recipe.ingredientsTotal} Ingredients
              </p>
              <p className="text-[10.5px] text-[var(--text-secondary)]">
                {recipe.missingIngredient
                  ? `Missing: ${recipe.missingIngredient} (can be skipped or swapped)`
                  : '100% Ready • Everything available!'}
              </p>
            </div>
          </div>

          {recipe.ingredientsHave === recipe.ingredientsTotal ? (
            <CheckCircle2 size={16} className="text-[var(--success)] shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-[var(--accent-text-on-light)] shrink-0" />
          )}
        </div>

        {/* Short Summary */}
        <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
          {recipe.summary}
        </p>

        {/* Chef Tip Callout */}
        {recipe.chefTip && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] flex items-start gap-2">
            <ChefHat size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-[var(--text-secondary)] italic">
              <span className="font-semibold not-italic text-[var(--text-primary)]">Chef Mise: </span>
              {recipe.chefTip}
            </p>
          </div>
        )}

        {/* Collapsible Steps Toggle */}
        <button
          onClick={() => {
            haptic(6)
            setShowSteps(!showSteps)
          }}
          className="w-full flex items-center justify-between pt-1 text-[11.5px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>{showSteps ? 'Hide 3-Step Method' : 'View 3-Step Method'}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${showSteps ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5 pt-1 overflow-hidden"
            >
              {recipe.quickSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-[11.5px] text-[var(--text-secondary)] leading-normal"
                >
                  <span className="w-4 h-4 rounded-full bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-[var(--text-primary)] text-[9.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action Buttons ── */}
        <div className="pt-2 border-t border-[var(--bg-card-border)] flex items-center gap-2">
          {/* Large CTA: Start Cooking */}
          <Link
            href={`/mobile/steps?id=${recipe.id}&title=${encodeURIComponent(recipe.name)}`}
            onClick={() => haptic(20)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-[12px] font-bold shadow-xs active:scale-[0.98] transition-all"
          >
            <Play size={13} className="fill-current" />
            <span>Start Cooking</span>
          </Link>

          {/* Alternative Version CTA */}
          {onAlternative && (
            <button
              onClick={() => {
                haptic(10)
                onAlternative()
              }}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[var(--bg-page)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-[11.5px] font-semibold border border-[var(--bg-card-border)] transition-colors"
            >
              <RotateCw size={12} />
              <span>Alternative</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
