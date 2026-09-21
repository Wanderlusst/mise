'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CookingStatusBanner from './CookingStatusBanner'
import CookingJourneyTimeline from './CookingJourneyTimeline'
import ChefAssistant from './ChefAssistant'
import StickyCookingBottomBar from './StickyCookingBottomBar'
import RecipeCompletionCelebration from './RecipeCompletionCelebration'
import { StepData } from './ActiveStepCard'
import { CookingIngredient } from './IngredientIntelligence'
import { playChime } from './soundUtils'
import { useHaptic } from '@/lib/useHaptic'

export interface CookingRecipe {
  id: string
  name: string
  category?: string
  diet?: string
  time_minutes: number
  servings: number
  image_url?: string
  ingredients: CookingIngredient[]
  steps: StepData[]
  adapted?: boolean
  adaptationReason?: string
}

interface CookingExperienceProps {
  recipe: CookingRecipe
  onExit?: () => void
  onViewSimilar?: () => void
  onViewTicket?: () => void
  className?: string
}

export default function CookingExperience({
  recipe,
  onExit,
  onViewSimilar,
  onViewTicket,
  className = '',
}: CookingExperienceProps) {
  const router = useRouter()
  const haptic = useHaptic()

  // ── States ──
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set())
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(null)
  const [isCookingPaused, setIsCookingPaused] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const steps = recipe.steps || []
  const totalSteps = steps.length
  const allDone = steps.length > 0 && doneSteps.size === steps.length

  // Synchronize active cooking session with Home Screen
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (allDone) {
      localStorage.removeItem('mise_active_cooking_v1')
      window.dispatchEvent(new Event('mise_active_cooking_changed'))
    } else if (recipe && steps.length > 0) {
      const remainingMins = steps
        .filter((_, idx) => !doneSteps.has(idx))
        .reduce((acc, curr) => acc + (curr.duration_minutes || 2), 0)

      const sessionData = {
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeImage: recipe.image_url || '/food/pasta.jpg',
        currentStepIndex: activeStepIndex,
        totalSteps: steps.length,
        totalRemainingMinutes: remainingMins,
        currentInstruction: steps[activeStepIndex]?.instruction || '',
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem('mise_active_cooking_v1', JSON.stringify(sessionData))
      window.dispatchEvent(new Event('mise_active_cooking_changed'))
    }
  }, [allDone, recipe, activeStepIndex, steps, doneSteps])

  // Overall session elapsed timer
  useEffect(() => {
    if (allDone || isCookingPaused) return
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [allDone, isCookingPaused])

  // Compute total remaining minutes across unfinished steps
  const remainingMinutes = steps
    .filter((_, idx) => !doneSteps.has(idx))
    .reduce((acc, curr) => acc + (curr.duration_minutes || 2), 0)

  // ── Step completion logic ──
  const completeStep = useCallback(
    (index: number) => {
      haptic(20)
      playChime('stepComplete')

      setLastCompletedIndex(index)
      setDoneSteps((prev) => {
        const next = new Set(Array.from(prev))
        next.add(index)
        return next
      })

      // Auto-advance to next unfinished step if currently on completed step
      if (index === activeStepIndex) {
        let nextIdx = index + 1
        while (nextIdx < totalSteps && doneSteps.has(nextIdx)) {
          nextIdx++
        }
        if (nextIdx < totalSteps) {
          setActiveStepIndex(nextIdx)
        }
      }

      // Reset burst after animation finishes
      setTimeout(() => {
        setLastCompletedIndex(null)
      }, 1000)
    },
    [activeStepIndex, doneSteps, haptic, totalSteps]
  )

  const toggleStepDone = useCallback(
    (index: number) => {
      if (doneSteps.has(index)) {
        haptic(10)
        playChime('click')
        setDoneSteps((prev) => {
          const next = new Set(Array.from(prev))
          next.delete(index)
          return next
        })
        setActiveStepIndex(index)
      } else {
        completeStep(index)
      }
    },
    [doneSteps, completeStep, haptic]
  )

  const handleNextStep = useCallback(() => {
    // If current step is not marked done, mark it done first
    if (!doneSteps.has(activeStepIndex)) {
      completeStep(activeStepIndex)
    } else if (activeStepIndex < totalSteps - 1) {
      setActiveStepIndex((prev) => prev + 1)
    }
  }, [activeStepIndex, doneSteps, completeStep, totalSteps])

  const handlePrevStep = useCallback(() => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1)
    }
  }, [activeStepIndex])

  const handleCookAgain = () => {
    haptic(20)
    playChime('click')
    setDoneSteps(new Set())
    setActiveStepIndex(0)
    setElapsedSeconds(0)
    setIsCookingPaused(false)
  }

  const handleExit = () => {
    if (onExit) {
      onExit()
    } else {
      router.push('/mobile')
    }
  }

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'ArrowRight' || (e.key === 'Enter' && !allDone)) {
        e.preventDefault()
        handleNextStep()
      } else if (e.key === 'ArrowLeft' && !allDone) {
        e.preventDefault()
        handlePrevStep()
      } else if (e.code === 'Space' && !allDone) {
        e.preventDefault()
        setIsCookingPaused((p) => !p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextStep, handlePrevStep, allDone])

  const currentStep = steps[activeStepIndex] || steps[0]

  return (
    <div className={`relative flex flex-col min-h-screen px-4 pb-28 pt-3 max-w-mobile mx-auto ${className}`}>
      {/* ── Sticky Top Smart Status Banner ── */}
      <div className="sticky top-2 z-30 mb-4 pt-1">
        <CookingStatusBanner
          currentStepIndex={activeStepIndex}
          totalSteps={totalSteps}
          currentInstruction={currentStep?.instruction}
          totalRemainingMinutes={remainingMinutes}
        />
      </div>

      {/* ── Main Cooking Area ── */}
      <AnimatePresence mode="wait">
        {allDone ? (
          /* ── Premium Celebration Screen ── */
          <motion.div
            key="celebration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="my-auto py-6"
          >
            <RecipeCompletionCelebration
              recipe={{
                id: recipe.id,
                name: recipe.name,
                time_minutes: recipe.time_minutes,
                servings: recipe.servings,
                ingredients: recipe.ingredients,
                steps: steps.map((s, i) => ({ id: s.id || `s-${i}`, instruction: s.instruction })),
                image_url: recipe.image_url,
              }}
              elapsedSeconds={elapsedSeconds}
              onExit={handleExit}
              onCookAgain={handleCookAgain}
              onViewSimilar={onViewSimilar || (() => router.push('/mobile'))}
              onViewTicket={onViewTicket}
            />
          </motion.div>
        ) : (
          /* ── Vertical Cooking Journey Timeline ── */
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <CookingJourneyTimeline
              steps={steps}
              activeStepIndex={activeStepIndex}
              doneSteps={doneSteps}
              allIngredients={recipe.ingredients}
              onStepSelect={(idx) => setActiveStepIndex(idx)}
              onStepComplete={(idx) => toggleStepDone(idx)}
              lastCompletedIndex={lastCompletedIndex}
            />

            {/* Floating Chef Assistant Pill/Card */}
            <div className="mt-4 mb-8">
              <ChefAssistant
                currentStepIndex={activeStepIndex}
                totalSteps={totalSteps}
                instruction={currentStep?.instruction}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky Bottom Floating Controls (Hidden once recipe completed) ── */}
      {!allDone && (
        <StickyCookingBottomBar
          currentStepIndex={activeStepIndex}
          totalSteps={totalSteps}
          isCookingPaused={isCookingPaused}
          onTogglePause={() => setIsCookingPaused(!isCookingPaused)}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
          onExit={handleExit}
        />
      )}
    </div>
  )
}
