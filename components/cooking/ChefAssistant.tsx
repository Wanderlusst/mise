'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ChefHat, MessageSquare } from 'lucide-react'

interface ChefAssistantProps {
  currentStepIndex: number
  totalSteps: number
  instruction?: string
  className?: string
}

function getChefComment(stepIndex: number, totalSteps: number, instruction: string): string {
  const text = instruction.toLowerCase()

  if (stepIndex === 0) {
    return 'Mise en place! Having everything chopped makes cooking a breeze.'
  }
  if (stepIndex === totalSteps - 1) {
    return 'Final step! Take a moment to savor that aroma before plating.'
  }
  if (stepIndex === totalSteps - 2) {
    return 'Almost done! Looking delicious and nearly ready to serve.'
  }
  if (text.includes('garlic') || text.includes('onion')) {
    return 'Vegetables are coming along nicely. Keep the heat controlled!'
  }
  if (text.includes('pan') || text.includes('skillet') || text.includes('heat')) {
    return 'Get the pan nicely preheated so your aromatics sizzle immediately.'
  }
  if (text.includes('simmer') || text.includes('boil')) {
    return 'Steady simmer allows all the flavors to meld together beautifully.'
  }

  const genericCompliments = [
    'Great work! You are cooking like a pro.',
    'Looking delicious! Perfect technique.',
    'Smooth momentum! One step closer to a masterpiece.',
    'Smelling fantastic in your kitchen right now!',
  ]

  return genericCompliments[stepIndex % genericCompliments.length]
}

export default function ChefAssistant({
  currentStepIndex,
  totalSteps,
  instruction = '',
  className = '',
}: ChefAssistantProps) {
  const [dismissed, setDismissed] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [customTipIndex, setCustomTipIndex] = useState<number | null>(null)

  // Reset dismissed state when moving to a new step so chef can offer next guidance
  useEffect(() => {
    setDismissed(false)
    setCustomTipIndex(null)
  }, [currentStepIndex])

  const message = useMemo(() => {
    if (customTipIndex !== null) {
      const proTips = [
        'Pro-tip: Season in layers, not just at the end.',
        'Pro-tip: Taste as you go for perfect balance.',
        'Pro-tip: Clean as you cook to stay calm and organized.',
      ]
      return proTips[customTipIndex % proTips.length]
    }
    return getChefComment(currentStepIndex, totalSteps, instruction)
  }, [currentStepIndex, totalSteps, instruction, customTipIndex])

  if (dismissed) return null

  return (
    <div className={`select-none ${className}`}>
      <AnimatePresence mode="wait">
        {minimized ? (
          /* Minimized floating avatar icon */
          <motion.button
            key="minimized"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMinimized(false)}
            aria-label="Open Chef Assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs cursor-pointer"
          >
            <ChefHat size={14} className="text-[var(--accent)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">Chef</span>
          </motion.button>
        ) : (
          /* Full floating message card */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="relative flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs max-w-sm"
          >
            {/* Chef Avatar */}
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--accent)] shadow-xs flex-shrink-0 cursor-pointer text-white"
              onClick={() => setCustomTipIndex((prev) => ((prev ?? 0) + 1))}
              title="Tap for culinary pro-tip"
            >
              <ChefHat size={18} className="text-white drop-shadow-xs" />
            </motion.div>

            {/* Content & Speech Bubble */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-stone-900 dark:text-white">
                  Chef Assistant
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                  • live guide
                </span>
              </div>

              <motion.p
                key={message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-stone-700 dark:text-stone-300 leading-snug"
              >
                {message}
              </motion.p>
            </div>

            {/* Dismiss / Minimize buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss assistant"
                className="w-5 h-5 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
