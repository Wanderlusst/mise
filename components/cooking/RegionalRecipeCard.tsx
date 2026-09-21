'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Zap, CheckCircle2, Clock } from 'lucide-react'
import { RegionalRecipe, MatchResult } from '@/lib/regionalRecipes'
import { useHaptic } from '@/lib/useHaptic'

interface RegionalRecipeCardProps {
  recipe: RegionalRecipe
  match: MatchResult
  onCookClick?: () => void
}

export function RegionalRecipeCard({
  recipe,
  match,
  onCookClick,
}: RegionalRecipeCardProps) {
  const haptic = useHaptic()

  // Match badge styling
  const isHighMatch = match.matchPercentage >= 85

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="w-[260px] sm:w-[280px] shrink-0 select-none group flex flex-col"
    >
      <div className="relative overflow-hidden rounded-[26px] bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex flex-col h-full transition-all group-hover:border-[var(--accent)]/30 group-hover:shadow-md">
        {/* ── Recipe Visual Frame ── */}
        <Link
          href={`/mobile/detail/${recipe.id}`}
          onClick={() => haptic(8)}
          className="relative w-full aspect-[4/3] bg-stone-100 dark:bg-stone-900 overflow-hidden block"
        >
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            sizes="(max-width: 640px) 260px, 280px"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle warm gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

          {/* Top Left: Regional Heritage Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 text-[10px] font-apple font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <span>{recipe.region}</span>
            </span>
          </div>

          {/* Top Right: Cook Time Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold flex items-center gap-1 shadow-xs">
              <Zap size={11} className="text-amber-400 fill-amber-400" />
              <span>{recipe.time}m</span>
            </span>
          </div>

          {/* Bottom Overlay on Image: Ingredient Match Pill */}
          <div className="absolute bottom-2.5 inset-x-3 z-10">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${
                isHighMatch
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-stone-900/80 text-stone-200 border border-white/20'
              }`}
            >
              <CheckCircle2 size={12} strokeWidth={2.5} className="shrink-0" />
              <span className="truncate">{match.matchLabel}</span>
            </div>
          </div>
        </Link>

        {/* ── Card Content & One-Tap Cook CTA ── */}
        <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5 bg-[var(--bg-card)]">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-1.5">
              <Link
                href={`/mobile/detail/${recipe.id}`}
                onClick={() => haptic(8)}
                className="hover:text-[var(--accent)] transition-colors flex-1 min-w-0"
              >
                <h3 className="font-apple font-bold text-sm sm:text-base text-[var(--text-primary)] leading-tight tracking-tight truncate">
                  {recipe.name}
                </h3>
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] shrink-0">
                {recipe.diet}
              </span>
            </div>

            <p className="text-[11px] font-semibold text-[var(--accent-text-on-light)] truncate">
              {recipe.regionalName}
            </p>

            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed pt-0.5">
              {recipe.subtitle}
            </p>
          </div>

          {/* Action Row with One-Tap "Cook" */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--bg-card-border)]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
              <Clock size={12} />
              <span>{recipe.time} mins</span>
            </div>

            <Link
              href={`/steps/${recipe.id}?servings=2`}
              onClick={() => {
                haptic(14)
                if (onCookClick) onCookClick()
              }}
              aria-label={`Cook ${recipe.name}`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-apple font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={11} fill="currentColor" />
              <span>Cook</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
