'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, X, Check, AlertTriangle } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { playChime } from './soundUtils'

interface StickyCookingBottomBarProps {
  currentStepIndex: number
  totalSteps: number
  isCookingPaused: boolean
  onTogglePause: () => void
  onPrevStep: () => void
  onNextStep: () => void
  onExit: () => void
  className?: string
}

export default function StickyCookingBottomBar({
  currentStepIndex,
  totalSteps,
  isCookingPaused,
  onTogglePause,
  onPrevStep,
  onNextStep,
  onExit,
  className = '',
}: StickyCookingBottomBarProps) {
  const haptic = useHaptic()
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === totalSteps - 1

  const handleNext = () => {
    haptic(15)
    playChime('click')
    onNextStep()
  }

  const handlePrev = () => {
    if (isFirstStep) return
    haptic(10)
    playChime('click')
    onPrevStep()
  }

  const handlePauseToggle = () => {
    haptic(12)
    playChime('click')
    onTogglePause()
  }

  const handleExitClick = () => {
    haptic(10)
    setShowExitConfirm(true)
  }

  return (
    <>
      {/* ── Sticky Floating Navigation Bar ── */}
      <div
        className={`fixed bottom-4 left-4 right-4 max-w-mobile mx-auto z-40 select-none ${className}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs"
        >
          {/* Exit Cooking Button */}
          <button
            type="button"
            onClick={handleExitClick}
            aria-label="Exit Cooking Mode"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-red-500 active:scale-95 transition-all cursor-pointer"
          >
            <X size={17} />
          </button>

          {/* Center Group: Prev & Pause/Resume */}
          <div className="flex items-center gap-1.5">
            {/* Previous Step */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              aria-label="Previous step"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-page)] text-[var(--text-secondary)] disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Pause / Resume Cooking */}
            <button
              type="button"
              onClick={handlePauseToggle}
              aria-label={isCookingPaused ? 'Resume cooking session' : 'Pause cooking session'}
              className="flex items-center justify-center px-3 h-10 rounded-full bg-[var(--bg-page)] text-[var(--text-primary)] text-xs font-semibold gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              {isCookingPaused ? (
                <>
                  <Play size={14} fill="currentColor" className="text-[var(--accent)]" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause size={14} fill="currentColor" className="text-[var(--text-secondary)]" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Action Button: Next Step / Complete */}
          <button
            type="button"
            onClick={handleNext}
            aria-label={isLastStep ? 'Complete Recipe' : 'Go to next step'}
            className="flex-1 max-w-[160px] flex items-center justify-center gap-1.5 h-10 px-4 rounded-full font-apple font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer hover:opacity-95"
            style={{
              background: isLastStep ? 'var(--success)' : 'var(--accent)',
              color: '#ffffff',
            }}
          >
            {isLastStep ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>Finish Recipe</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight size={15} />
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* ── Confirmation Modal on Exit ── */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitConfirm(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              className="relative w-full max-w-xs p-5 rounded-3xl bg-[var(--bg-card)] shadow-xs border border-[var(--bg-card-border)] text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} />
              </div>

              <h4 className="text-base font-bold font-apple text-[var(--text-primary)] mb-1">
                Pause or Exit Cooking?
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                You are on Step {currentStepIndex + 1} of {totalSteps}. Your current progress will be preserved.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-2.5 rounded-full bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Keep Cooking
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false)
                    onExit()
                  }}
                  className="w-full py-2 rounded-full text-[var(--text-secondary)] hover:text-red-500 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Exit Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
