'use client'

import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ActiveStepCard, { StepData } from './ActiveStepCard'
import { AnimatedCheckmark } from './StepCompletionBurst'
import { CookingIngredient } from './IngredientIntelligence'

interface CookingJourneyTimelineProps {
  steps: StepData[]
  activeStepIndex: number
  doneSteps: Set<number>
  allIngredients?: CookingIngredient[]
  onStepSelect: (index: number) => void
  onStepComplete: (index: number) => void
  lastCompletedIndex: number | null
  className?: string
}

export default function CookingJourneyTimeline({
  steps,
  activeStepIndex,
  doneSteps,
  allIngredients = [],
  onStepSelect,
  onStepComplete,
  lastCompletedIndex,
  className = '',
}: CookingJourneyTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Liquid line progress percentage
  const total = steps.length
  const progressRatio = total > 1 ? Math.min(1, (doneSteps.size) / (total - 1)) : 0

  return (
    <div ref={containerRef} className={`relative pb-6 ${className}`}>
      {/* ── Vertical Journey Track (Duolingo / Apple Fitness liquid flow) ── */}
      <div className="absolute left-[18px] top-6 bottom-8 w-1 rounded-full bg-stone-200/80 dark:bg-white/10 pointer-events-none z-0">
        {/* Liquid filled progress track */}
        <motion.div
          className="w-full rounded-full pointer-events-none origin-top"
          style={{
            background: 'linear-gradient(to bottom, var(--success) 0%, var(--accent) 100%)',
            boxShadow: '0 0 8px var(--accent)',
          }}
          initial={{ height: '0%' }}
          animate={{ height: `${progressRatio * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Steps list */}
      <div className="flex flex-col gap-4 relative z-10">
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex
          const isDone = doneSteps.has(idx)
          const isFuture = !isActive && !isDone
          const isJustCompleted = lastCompletedIndex === idx

          return (
            <div key={step.id || idx} className="flex items-start gap-3">
              {/* ── Journey Step Node ── */}
              <div className="relative flex flex-col items-center flex-shrink-0 w-9 pt-3.5 select-none">
                {isDone ? (
                  /* Completed Node */
                  <div
                    onClick={() => onStepSelect(idx)}
                    className="relative w-8 h-8 rounded-full bg-[var(--success)] flex items-center justify-center text-white cursor-pointer shadow-xs z-10"
                  >
                    <AnimatedCheckmark size={15} strokeWidth={3} />
                  </div>
                ) : isActive ? (
                  /* Active Node (Clean, crisp, no pulsing) */
                  <div className="relative w-8 h-8 flex items-center justify-center z-10">
                    <div
                      className="relative w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xs shadow-xs border-2 border-white dark:border-[var(--bg-card)] cursor-pointer"
                    >
                      <span>{idx + 1}</span>
                    </div>
                  </div>
                ) : (
                  /* Future Inactive Node */
                  <div
                    onClick={() => onStepSelect(idx)}
                    className="w-7 h-7 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] flex items-center justify-center text-[11px] font-mono font-semibold text-[var(--text-secondary)] cursor-pointer shadow-xs z-10"
                  >
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* ── Step Card ── */}
              <div className="flex-1 min-w-0">
                <ActiveStepCard
                  step={step}
                  index={idx}
                  totalSteps={steps.length}
                  isActive={isActive}
                  isDone={isDone}
                  isFuture={isFuture}
                  allIngredients={allIngredients}
                  onComplete={() => onStepComplete(idx)}
                  onSelect={() => onStepSelect(idx)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
