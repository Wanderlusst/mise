'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChefHat, Sparkles } from 'lucide-react'
import { type SavedRecipe } from '@/lib/useSavedRecipes'
import { useHaptic } from '@/lib/useHaptic'

interface CollectionShelfProps {
  title: string
  subtitle?: string
  recipes: SavedRecipe[]
  onSelectRecipe?: (recipe: SavedRecipe) => void
}

export function RecipeCollectionsShelf({
  title,
  subtitle,
  recipes,
}: CollectionShelfProps) {
  const haptic = useHaptic()

  if (recipes.length === 0) return null

  return (
    <div className="mb-8 select-none">
      <div className="flex items-baseline justify-between px-5 mb-3">
        <div>
          <h3 className="text-[17px] font-bold text-[var(--text-primary)] font-apple tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <span className="text-[12px] font-semibold text-[var(--accent-text-on-light)]">
          {recipes.length} dishes
        </span>
      </div>

      <div
        className="flex gap-3.5 overflow-x-auto no-scrollbar px-5 pb-2 scroll-px-5 scroll-smooth"
        style={{
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: '1.25rem',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
        }}
      >
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex-shrink-0 w-[190px] rounded-[24px] overflow-hidden group cursor-pointer
                       active:scale-[0.98] transition-transform duration-150
                       bg-[var(--bg-card)] border border-[var(--bg-card-border)]"
            style={{ scrollSnapAlign: 'start' }}
            onClick={() => haptic(8)}
          >
            <Link href={`/mobile/detail/${recipe.id}`} className="block">
              {/* Image */}
              <div className="relative h-[125px] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                <Image
                  src={recipe.image}
                  alt={recipe.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="190px"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] font-bold text-white backdrop-blur-md bg-black/40 border border-white/20">
                  <span className="flex items-center gap-1">
                    <Clock size={10} strokeWidth={2.4} className="text-[var(--accent)]" />
                    {recipe.time}m
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-3">
                <h4 className="text-[14px] font-bold text-[var(--text-primary)] font-apple line-clamp-1">
                  {recipe.name}
                </h4>
                <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-secondary)]">
                  <span>{recipe.timesCooked ? `${recipe.timesCooked} cooked` : 'To Cook'}</span>
                  {recipe.badge && (
                    <span className="text-[var(--accent-text-on-light)] font-semibold">{recipe.badge}</span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
