'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Clock,
  UtensilsCrossed,
  Utensils,
  Soup,
  CookingPot,
  ChefHat,
  type LucideIcon,
} from 'lucide-react'

interface CookingStatusBannerProps {
  currentStepIndex: number
  totalSteps: number
  currentInstruction?: string
  totalRemainingMinutes?: number
  className?: string
  onClick?: () => void
}

export function getContextualCookingStatus(instruction: string = '', stepIndex: number, totalSteps: number): {
  icon: LucideIcon
  action: string
  detail: string
} {
  const text = instruction.toLowerCase()

  if (stepIndex === totalSteps - 1) {
    return { icon: Utensils, action: 'Plating & Garnish', detail: 'Final culinary touch' }
  }

  // Chopping / prepping detection
  if (text.includes('garlic')) {
    return { icon: UtensilsCrossed, action: 'Chopping Garlic', detail: 'Aromatic release' }
  }
  if (text.includes('onion') || text.includes('shallot')) {
    return { icon: UtensilsCrossed, action: 'Slicing Onions', detail: 'Prep station' }
  }
  if (text.includes('tomato')) {
    return { icon: UtensilsCrossed, action: 'Preparing Vegetables', detail: 'Fresh produce' }
  }
  if (text.includes('chop') || text.includes('dice') || text.includes('slice') || text.includes('mince') || text.includes('rinse')) {
    return { icon: UtensilsCrossed, action: 'Prepping Fresh Ingredients', detail: 'Mise en place' }
  }

  // Pan / heat / sauté detection
  if (text.includes('heat') && (text.includes('pan') || text.includes('skillet') || text.includes('oil'))) {
    return { icon: Flame, action: 'Heating Pan', detail: 'Sizzle incoming' }
  }
  if (text.includes('sauté') || text.includes('fry') || text.includes('sear') || text.includes('brown')) {
    return { icon: Flame, action: 'Sautéing Station', detail: 'Active sizzle' }
  }

  // Simmer / boil / pasta detection
  if (text.includes('boil') || text.includes('pasta') || text.includes('noodle')) {
    return { icon: Soup, action: 'Boiling Pasta', detail: 'Al dente focus' }
  }
  if (text.includes('simmer') || text.includes('sauce') || text.includes('reduce') || text.includes('pot')) {
    return { icon: CookingPot, action: 'Simmering Sauce', detail: 'Flavor infusion' }
  }

  // Mixing / tossing detection
  if (text.includes('whisk') || text.includes('toss') || text.includes('stir') || text.includes('combine') || text.includes('blend')) {
    return { icon: Utensils, action: 'Combining & Tossing', detail: 'Emulsifying' }
  }

  // Oven / roast
  if (text.includes('bake') || text.includes('roast') || text.includes('broil') || text.includes('oven')) {
    return { icon: Flame, action: 'Roasting in Oven', detail: 'Golden browning' }
  }

  // Position-based fallbacks
  if (stepIndex === 0) {
    return { icon: UtensilsCrossed, action: 'Preparing Ingredients', detail: 'Starting strong' }
  }

  return { icon: ChefHat, action: `Cooking Step ${stepIndex + 1}`, detail: 'Mastering flavors' }
}

export default function CookingStatusBanner({
  currentStepIndex,
  totalSteps,
  currentInstruction = '',
  totalRemainingMinutes,
  className = '',
  onClick,
}: CookingStatusBannerProps) {
  const status = useMemo(
    () => getContextualCookingStatus(currentInstruction, currentStepIndex, totalSteps),
    [currentInstruction, currentStepIndex, totalSteps]
  )

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / totalSteps) * 100))

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`relative overflow-hidden rounded-full cursor-pointer select-none bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs ${className}`}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      role="status"
      aria-live="polite"
      aria-label={`Cooking step ${currentStepIndex + 1} of ${totalSteps}: ${status.action}`}
    >
      {/* Background dynamic progress gradient fill */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'var(--accent)',
          width: `${progressPercent}%`,
        }}
        initial={false}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 gap-3">
        {/* Left: Animated icon + contextual action */}
        <div className="flex items-center gap-2.5 min-w-0">
          <motion.div
            key={status.action}
            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-page)] shadow-xs border border-[var(--bg-card-border)] text-[var(--accent)] flex-shrink-0"
          >
            <status.icon size={15} strokeWidth={2.2} />
          </motion.div>

          <div className="min-w-0 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={status.action}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-xs sm:text-sm font-apple font-bold text-[var(--text-primary)] tracking-tight truncate">
                  {status.action}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse flex-shrink-0" />
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium">
              <span className="flex items-center gap-1 font-semibold text-[var(--accent-text-on-light)]">
                <Flame size={11} className="animate-bounce" />
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <span>•</span>
              <span className="truncate text-[var(--text-secondary)]">{status.detail}</span>
            </div>
          </div>
        </div>

        {/* Right: Remaining time badge & micro progress pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalRemainingMinutes !== undefined && totalRemainingMinutes > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-[11px] font-mono font-semibold text-[var(--text-primary)] shadow-xs tabular-nums"
            >
              <Clock size={11} className="text-[var(--accent-text-on-light)]" />
              <span>{totalRemainingMinutes}m left</span>
            </motion.div>
          )}

          {/* Mini progress completion percentage */}
          <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 flex items-center justify-center border border-[var(--accent)]/30">
            <span className="text-[10px] font-mono font-bold text-[var(--accent-text-on-light)]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
