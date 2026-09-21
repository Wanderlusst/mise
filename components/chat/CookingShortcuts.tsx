'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed,
  Trash2,
  Clock,
  Coins,
  Salad,
  Cookie,
  CookingPot,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'

interface CookingShortcutsProps {
  onSelect: (query: string) => void
  onOpenFoodWaste?: () => void
  disabled?: boolean
}

interface ShortcutItem {
  id: string
  icon: LucideIcon
  label: string
  query: string
  isWasteAction?: boolean
}

export const SHORTCUTS: ShortcutItem[] = [
  {
    id: 'ingredients',
    icon: UtensilsCrossed,
    label: 'Use My Ingredients',
    query: 'What can I cook using only the ingredients in my pantry right now?',
  },
  {
    id: 'waste',
    icon: Trash2,
    label: 'Reduce Food Waste',
    query: "What's going bad in my fridge and how do I rescue it?",
    isWasteAction: true,
  },
  {
    id: 'quick',
    icon: Clock,
    label: 'Quick Dinner',
    query: 'Show me ultra quick dinner recipes ready in 15 minutes or less.',
  },
  {
    id: 'budget',
    icon: Coins,
    label: 'Budget Meals',
    query: 'What delicious high-value budget meal can I cook with basic essentials?',
  },
  {
    id: 'healthy',
    icon: Salad,
    label: 'Healthy Options',
    query: 'Give me clean, nutritious, balanced meal ideas for tonight.',
  },
  {
    id: 'dessert',
    icon: Cookie,
    label: 'Dessert Ideas',
    query: 'Quick dessert ideas using yogurt, honey, or pantry fruit.',
  },
  {
    id: 'one_pot',
    icon: CookingPot,
    label: 'One Pot Meals',
    query: 'I want a 1-pot or 1-pan meal with minimal cleanup required.',
  },
  {
    id: 'cuisines',
    icon: Globe,
    label: 'Explore Cuisines',
    query: 'Show me something vibrant and authentic from regional Indian or Mediterranean cuisines.',
  },
]

export function CookingShortcuts({
  onSelect,
  onOpenFoodWaste,
  disabled = false,
}: CookingShortcutsProps) {
  const haptic = useHaptic()

  return (
    <div className="mb-5 w-full min-w-0">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
          Culinary Shortcuts
        </span>
        <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
          Smart Actions
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 -mx-5 px-5 scroll-px-5 scroll-smooth">
        {SHORTCUTS.map((sc) => (
          <motion.button
            key={sc.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            onClick={() => {
              haptic(10)
              if (sc.isWasteAction && onOpenFoodWaste) {
                onOpenFoodWaste()
              } else {
                onSelect(sc.query)
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-[var(--text-primary)] text-[11px] font-semibold whitespace-nowrap shadow-xs transition-colors shrink-0"
          >
            <sc.icon size={13} className="text-[var(--accent)] shrink-0" />
            <span>{sc.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
