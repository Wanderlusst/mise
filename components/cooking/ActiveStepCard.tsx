'use client'

import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  UtensilsCrossed,
  Flame,
  Soup,
  CookingPot,
  ChefHat,
  type LucideIcon,
} from 'lucide-react'
import CircularProgressTimer from './CircularProgressTimer'
import IngredientIntelligence, { CookingIngredient } from './IngredientIntelligence'
import { AnimatedCheckmark } from './StepCompletionBurst'

export interface StepData {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number | null
  parallel?: boolean
}

interface ActiveStepCardProps {
  step: StepData
  index: number
  totalSteps: number
  isActive: boolean
  isDone: boolean
  isFuture: boolean
  allIngredients?: CookingIngredient[]
  onComplete: () => void
  onSelect: () => void
  className?: string
}

function getStepCategory(instruction: string = ''): { tag: string; icon: LucideIcon } {
  const text = instruction.toLowerCase()
  if (text.includes('chop') || text.includes('slice') || text.includes('dice') || text.includes('peel') || text.includes('rinse')) {
    return { tag: 'Prep Station', icon: UtensilsCrossed }
  }
  if (text.includes('sauté') || text.includes('sear') || text.includes('fry') || text.includes('heat') || text.includes('pan')) {
    return { tag: 'Sauté Station', icon: Flame }
  }
  if (text.includes('boil') || text.includes('simmer') || text.includes('pasta') || text.includes('pot')) {
    return { tag: 'Simmer Station', icon: Soup }
  }
  if (text.includes('bake') || text.includes('roast') || text.includes('oven')) {
    return { tag: 'Roast Station', icon: Flame }
  }
  if (text.includes('toss') || text.includes('whisk') || text.includes('mix')) {
    return { tag: 'Mix Station', icon: CookingPot }
  }
  if (text.includes('plate') || text.includes('garnish') || text.includes('serve') || text.includes('drizzle')) {
    return { tag: 'Finishing Station', icon: Sparkles }
  }
  return { tag: 'Cooking Step', icon: ChefHat }
}

export default function ActiveStepCard({
  step,
  index,
  totalSteps,
  isActive,
  isDone,
  isFuture,
  allIngredients = [],
  onComplete,
  onSelect,
  className = '',
}: ActiveStepCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const category = useMemo(() => getStepCategory(step.instruction), [step.instruction])

  // ── 1. COMPLETED STEP (Compact success state) ─────────────────────────
  if (isDone) {
    return (
      <div
        onClick={onSelect}
        className={`p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--success)]/30 shadow-xs cursor-pointer select-none transition-colors ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Success Checkmark Circle */}
            <div className="w-6 h-6 rounded-full bg-[var(--success)] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <AnimatedCheckmark size={14} strokeWidth={3} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[var(--success)]">
                  Step {index + 1}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">• Completed</span>
              </div>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 truncate line-through decoration-stone-400">
                {step.instruction}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 text-xs flex-shrink-0">
            {step.duration_minutes && (
              <span className="text-[11px] font-mono">{step.duration_minutes}m</span>
            )}
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    )
  }

  // ── 2. FUTURE STEP (Collapsed preview) ────────────────────────────────
  if (isFuture) {
    return (
      <div
        onClick={onSelect}
        className={`p-3.5 rounded-2xl bg-[var(--bg-card)]/40 border border-[var(--bg-card-border)] opacity-70 hover:opacity-95 shadow-xs cursor-pointer select-none transition-colors ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[var(--bg-page)] border border-[var(--bg-card-border)] flex items-center justify-center text-[11px] font-mono font-semibold text-[var(--text-secondary)] flex-shrink-0">
              {index + 1}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono font-semibold text-stone-400 dark:text-stone-500">
                {category.tag}
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
                {step.instruction}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 text-xs flex-shrink-0">
            {step.duration_minutes && (
              <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                <Clock size={11} />
                <span>{step.duration_minutes}m</span>
              </span>
            )}
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    )
  }

  // ── 3. ACTIVE STEP (Dominant, expanded, solid state) ─────────
  return (
    <div
      className={`relative p-5 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--accent)] shadow-xs select-none overflow-hidden ${className}`}
    >
      {/* Background warm ambient radial highlight */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-2xl"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          {/* Station Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent-text-on-light)] text-xs font-semibold font-apple tracking-tight">
            <category.icon size={12} className="text-[var(--accent-text-on-light)]" />
            <span>{category.tag}</span>
          </span>

          {step.parallel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[11px] font-semibold">
              <Zap size={10} /> Parallel
            </span>
          )}
        </div>

        {/* Step Counter Badge */}
        <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400">
          Step {index + 1} of {totalSteps}
        </span>
      </div>

      {/* Instruction text (Primary focal point) */}
      <div className="relative z-10 mb-4">
        <h3 className="text-base sm:text-lg font-apple font-bold text-stone-900 dark:text-white leading-snug tracking-tight">
          {step.instruction}
        </h3>
      </div>

      {/* Ingredient Intelligence Strip */}
      {allIngredients.length > 0 && (
        <div className="relative z-10 mb-4 pt-1">
          <IngredientIntelligence
            ingredients={allIngredients}
            stepInstruction={step.instruction}
          />
        </div>
      )}

      {/* Timer Section (if step has duration) */}
      {step.duration_minutes !== null && step.duration_minutes !== undefined && step.duration_minutes > 0 && (
        <div className="relative z-10 my-4 py-3 border-y border-stone-100 dark:border-white/5 flex flex-col items-center">
          <CircularProgressTimer
            durationMinutes={step.duration_minutes}
            isActive={isActive}
            size={140}
          />
        </div>
      )}

      {/* Step Completion CTA */}
      <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
          <Sparkles size={12} className="text-[var(--accent)]" />
          Take your time for quality
        </span>

        <button
          type="button"
          onClick={onComplete}
          aria-label={`Mark step ${index + 1} as completed`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-apple font-bold text-xs text-white shadow-xs cursor-pointer active:scale-95 transition-all bg-[var(--success)] hover:opacity-95"
        >
          <Check size={14} strokeWidth={2.5} />
          <span>Complete Step</span>
        </button>
      </div>
    </div>
  )
}
