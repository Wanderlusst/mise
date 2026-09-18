'use client'

import { motion } from 'framer-motion'
import { type SavedCategory } from '@/lib/useSavedRecipes'

// ─── Category Data ─────────────────────────────────────────────────────────────
export const CATEGORIES: { id: SavedCategory; label: string; emoji: string }[] = [
  { id: 'All',       label: 'All',       emoji: '🍜' },
  { id: 'Drinks',    label: 'Drinks',    emoji: '🧃' },
  { id: 'Vegan',     label: 'Vegan',     emoji: '🥗' },
  { id: 'Protein',   label: 'Protein',   emoji: '💪' },
  { id: 'Snacks',    label: 'Snacks',    emoji: '🍟' },
  { id: 'Desserts',  label: 'Desserts',  emoji: '🍰' },
  { id: 'Breakfast', label: 'Breakfast', emoji: '🥞' },
]

interface CategoryFilterProps {
  active: SavedCategory
  onSelect: (cat: SavedCategory) => void
}

export function CategoryFilter({ active, onSelect }: CategoryFilterProps) {
  return (
    <div
      className="flex gap-3 overflow-x-auto no-scrollbar px-5 pt-1.5 pb-2 scroll-px-5 scroll-smooth"
      style={{
        scrollSnapType: 'x mandatory',
        scrollPaddingInline: '1.25rem',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x pan-y',
      }}
    >
      {CATEGORIES.map((cat, i) => {
        const isActive = active === cat.id
        return (
          <motion.button
            key={cat.id}
            id={`category-${cat.id.toLowerCase()}`}
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(cat.id)}
            className="relative flex flex-col items-center gap-2 flex-shrink-0 outline-none cursor-pointer"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Icon card */}
            <motion.div
              animate={{
                backgroundColor: isActive ? '#ffa371' : 'rgba(255,255,255,0.85)',
                scale: isActive ? 1.05 : 1,
                boxShadow: isActive
                  ? '0 4px 20px rgba(255, 163, 113, 0.38), 0 1px 4px rgba(0,0,0,0.06)'
                  : '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
              }}
              transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center
                         dark:bg-[#2c2c2c] border border-black/[0.05] dark:border-white/10
                         backdrop-blur-sm transition-colors"
              style={{
                backgroundColor: isActive ? '#ffa371' : undefined,
              }}
            >
              <span className="text-[30px] leading-none select-none">{cat.emoji}</span>
            </motion.div>

            {/* Label */}
            <motion.span
              animate={{
                color: isActive ? '#ffa371' : '#6b7280',
                fontWeight: isActive ? '600' : '500',
              }}
              transition={{ duration: 0.18 }}
              className="text-[12px] leading-none font-sans"
            >
              {cat.label}
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}
