'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ChefHat,
  Egg,
  Clock,
  Moon,
  PackageCheck,
  Heart,
  Flame,
  Cookie,
  Salad,
  type LucideIcon,
} from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'

interface SuggestionChipsProps {
  onSelect: (query: string) => void
  disabled?: boolean
}

interface StarterChip {
  id: string
  icon: LucideIcon
  label: string
  query: string
  tag?: string
  gradient?: string
}

export const STARTER_CHIPS: StarterChip[] = [
  {
    id: 'eggs',
    icon: Egg,
    label: 'I only have eggs',
    query: 'I only have eggs. What delicious dish can I make in minutes?',
  },
  {
    id: 'ten_min',
    icon: Clock,
    label: 'Dinner in 10 minutes',
    query: 'I need a fast, satisfying dinner ready in under 10 minutes.',
  },
  {
    id: 'exhausted',
    icon: Moon,
    label: "I'm exhausted",
    query: "I have eggs and rice, nothing else, and I'm exhausted. Easiest 1-pan meal?",
    tag: 'Popular',
  },
  {
    id: 'leftovers',
    icon: PackageCheck,
    label: 'Use my leftovers',
    query: 'Help me turn my fridge leftovers and cooked rice into a great dinner.',
  },
  {
    id: 'surprise',
    icon: ChefHat,
    label: 'Surprise me',
    query: 'Give me something completely different from what I usually cook.',
  },
  {
    id: 'healthy',
    icon: Salad,
    label: 'Something healthy',
    query: 'Show me a clean, vibrant, high-protein healthy bowl.',
  },
  {
    id: 'comfort',
    icon: Heart,
    label: 'Comfort food',
    query: 'I crave pure warm comfort food that requires minimum cleanup.',
  },
  {
    id: 'spicy',
    icon: Flame,
    label: 'Spicy dinner',
    query: 'Give me a fiery, aromatic dinner that packs serious chili flavor.',
  },
  {
    id: 'sweet',
    icon: Cookie,
    label: 'Sweet snack',
    query: 'Quick sweet snack without lots of refined sugar.',
  },
]

export function SuggestionChips({ onSelect, disabled = false }: SuggestionChipsProps) {
  const haptic = useHaptic()

  return (
    <div className="mb-5 w-full min-w-0">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
          <ChefHat size={13} className="text-amber-500" />
          <span>Ask Chef Mise Anything</span>
        </span>
        <span className="text-[10.5px] text-stone-500 dark:text-stone-400 font-medium">
          Tap to start
        </span>
      </div>

      {/* Grid of dynamic floating suggestion chips */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.04,
            },
          },
        }}
        className="flex flex-wrap gap-2"
      >
        {STARTER_CHIPS.map((chip) => (
          <motion.button
            key={chip.id}
            variants={{
              hidden: { opacity: 0, scale: 0.92, y: 8 },
              show: { opacity: 1, scale: 1, y: 0 },
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            disabled={disabled}
            onClick={() => {
              haptic(10)
              onSelect(chip.query)
            }}
            className="group relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] hover:border-[var(--accent)] transition-all text-left shadow-xs"
          >
            <chip.icon size={14} className="text-[var(--accent)] group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-[12px] font-semibold text-[var(--text-primary)]">
              {chip.label}
            </span>

            {chip.tag && (
              <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent)]/15 text-[9px] font-bold text-[var(--accent-text-on-light)]">
                {chip.tag}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
