'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, ChefHat } from 'lucide-react'
import { IndianRegion, RecipeMatchView } from '@/lib/recipeTypes'
import { useHaptic } from '@/lib/useHaptic'

interface SousChefBannerProps {
  region: IndianRegion
  pantryCount: number
  recommendedRecipe?: RecipeMatchView
}

export function SousChefBanner({
  region,
  pantryCount,
  recommendedRecipe,
}: SousChefBannerProps) {
  const haptic = useHaptic()

  // Determine time of day
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 16 ? 'afternoon' : hour < 21 ? 'evening' : 'night'

  const greeting = {
    title: `${timeOfDay === 'morning' ? 'Good morning' : 'Your kitchen is ready'}${region === 'All' ? '' : ` in ${region}`}`,
    prompt: pantryCount > 0 ? `I found recipes based on ${pantryCount} ingredients in your pantry.` : 'Pick a recipe and I’ll guide you step by step.',
  }

  return (
    <section className="relative overflow-hidden rounded-[30px] p-5 sm:p-6 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white shadow-xl border border-stone-800">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-1.5 text-xs font-apple font-bold uppercase tracking-wider text-[var(--accent)]">
            <ChefHat size={15} />
            <span>AI Sous Chef • {region === 'All' ? 'Pan-Indian Flavors' : region}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-apple font-bold tracking-tight text-white leading-tight">
            {greeting.title}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
            {greeting.prompt}
          </p>
        </div>

        {recommendedRecipe && (
          <div className="flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 justify-between sm:justify-start">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shadow-md shrink-0">
              <Image
                src={recommendedRecipe.imageUrl || '/food/bowl.jpg'}
                alt={recommendedRecipe.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="sm:hidden min-w-0">
              <p className="text-xs font-bold truncate text-white">{recommendedRecipe.name}</p>
              <p className="text-[10px] text-stone-300 font-medium">⚡ {recommendedRecipe.timeMinutes} mins</p>
            </div>

            <Link
              href={`/steps/${recommendedRecipe.id}?servings=2`}
              onClick={() => haptic(12)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-xs font-apple font-bold shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 ml-auto sm:ml-0"
            >
              <Play size={12} fill="currentColor" />
              <span>Cook {recommendedRecipe.name.split(' ')[0]}</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
