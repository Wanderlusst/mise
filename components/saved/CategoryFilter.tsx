'use client'

import { motion, type Transition } from 'framer-motion'
import {
  MiseHeartIcon,
  MiseClockIcon,
  MiseChefHatIcon,
  MiseBookmarkIcon,
  MiseStarIcon,
  MiseLeafIcon,
  MiseUtensilsIcon,
  MiseCookieIcon,
} from '@/components/icons/MiseIcons'
import { type SavedCategory } from '@/lib/useSavedRecipes'
import type React from 'react'

export interface CategoryItem {
  id: SavedCategory
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; filled?: boolean }>
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'All', label: 'All', icon: MiseUtensilsIcon },
  { id: 'Favorites', label: 'Favorites', icon: MiseHeartIcon },
  { id: 'Recently Cooked', label: 'Recently Cooked', icon: MiseClockIcon },
  { id: 'Ready To Cook', label: 'Ready To Cook', icon: MiseChefHatIcon },
  { id: 'Want To Cook', label: 'Want To Cook', icon: MiseBookmarkIcon },
  { id: 'Top Recipes', label: 'Top Recipes', icon: MiseStarIcon },
  { id: 'Healthy', label: 'Healthy', icon: MiseLeafIcon },
  { id: 'Comfort Food', label: 'Comfort Food', icon: MiseUtensilsIcon },
  { id: 'Desserts', label: 'Desserts', icon: MiseCookieIcon },
]

interface CategoryFilterProps {
  active: SavedCategory
  onSelect: (cat: SavedCategory) => void
  categoryCounts?: Partial<Record<SavedCategory, number>>
}

const PILL_TRANSITION: Transition = {
  type: 'tween',
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1],
}

export function CategoryFilter({ active, onSelect, categoryCounts }: CategoryFilterProps) {
  return (
    <div
      className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 pt-1.5 pb-3 scroll-px-5 scroll-smooth select-none"
      style={{
        scrollSnapType: 'x mandatory',
        scrollPaddingInline: '1.25rem',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x pan-y',
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        const count = categoryCounts ? categoryCounts[cat.id] : undefined
        const Icon = cat.icon

        return (
          <button
            key={cat.id}
            id={`category-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
            type="button"
            onClick={() => onSelect(cat.id)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-full flex-shrink-0 outline-none
                       cursor-pointer transition-transform duration-150 active:scale-[0.97]"
            style={{
              scrollSnapAlign: 'start',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeCategoryPill"
                transition={PILL_TRANSITION}
                className="absolute inset-0 rounded-full z-0 bg-[var(--accent)] shadow-xs"
              />
            )}

            {!isActive && (
              <div
                className="absolute inset-0 rounded-full z-0 bg-[var(--bg-card)]
                           border border-[var(--bg-card-border)] shadow-xs"
              />
            )}

            <Icon
              size={14}
              strokeWidth={2.1}
              filled={isActive && cat.id === 'Favorites'}
              className={`relative z-10 transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-[var(--accent-text-on-light)]'
              }`}
            />

            <span
              className={`relative z-10 text-[13px] tracking-tight font-medium transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {cat.label}
            </span>

            {typeof count === 'number' && (
              <span
                className={`relative z-10 text-[11px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)]'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
