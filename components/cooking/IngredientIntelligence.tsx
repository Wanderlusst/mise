'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, Info, Star } from 'lucide-react'
import IngredientThumbnail from '@/components/IngredientThumbnail'

export interface CookingIngredient {
  name: string
  quantity: string
  optional?: boolean
}

interface IngredientIntelligenceProps {
  ingredients: CookingIngredient[]
  stepInstruction: string
  className?: string
}

// Normalized matching helper
function doesStepRequireIngredient(stepText: string, ingredientName: string): boolean {
  if (!stepText || !ingredientName) return false
  const normStep = stepText.toLowerCase()
  const normName = ingredientName.toLowerCase().trim()

  // 1. Exact substring
  if (normStep.includes(normName)) return true

  // 2. Tokenized match (e.g., "Cherry Tomatoes" matches "tomatoes" or "tomato")
  const tokens = normName.split(/[\s,/-]+/).filter((t) => t.length > 2)
  for (const token of tokens) {
    if (normStep.includes(token)) return true
    // Stemming heuristic: remove trailing 's' or 'es'
    const singular = token.replace(/es$/, '').replace(/s$/, '')
    if (singular.length > 2 && normStep.includes(singular)) return true
  }

  // 3. Common culinary synonyms
  if (normName.includes('oil') && (normStep.includes('pan') || normStep.includes('skillet') || normStep.includes('sauté'))) {
    if (normStep.includes('oil')) return true
  }
  if (normName.includes('garlic') && normStep.includes('clove')) return true
  if (normName.includes('salt') && normStep.includes('season')) return true
  if (normName.includes('pepper') && normStep.includes('season')) return true

  return false
}

export default function IngredientIntelligence({
  ingredients = [],
  stepInstruction = '',
  className = '',
}: IngredientIntelligenceProps) {
  // Partition into required vs other ingredients for this step
  const { required, others } = useMemo(() => {
    const req: CookingIngredient[] = []
    const oth: CookingIngredient[] = []

    ingredients.forEach((ing) => {
      if (doesStepRequireIngredient(stepInstruction, ing.name)) {
        req.push(ing)
      } else {
        oth.push(ing)
      }
    })

    return { required: req, others: oth }
  }, [ingredients, stepInstruction])

  if (ingredients.length === 0) return null

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
          <Sparkles size={13} className="text-[var(--accent)]" />
          <span>Ingredient Intelligence</span>
        </div>
        {required.length > 0 ? (
          <span className="text-[11px] font-medium text-[var(--accent-text-on-light)] bg-[var(--accent)]/15 px-2 py-0.5 rounded-full">
            {required.length} needed for this step
          </span>
        ) : (
          <span className="text-[11px] text-[var(--text-secondary)]">All ingredients prepped</span>
        )}
      </div>

      {/* Horizontal scrolling shelf of ingredients */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-1 -mx-1 px-1 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {/* Highlighted required ingredients first */}
          {required.map((ing) => (
            <motion.div
              layout
              key={`req-${ing.name}`}
              initial={{ scale: 0.9, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="relative flex-shrink-0 flex items-center gap-2.5 p-2 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent)] shadow-xs cursor-pointer select-none"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Subtle pulsing background glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(217, 113, 60, 0.4)',
                    '0 0 0 6px rgba(217, 113, 60, 0)',
                    '0 0 0 0 rgba(217, 113, 60, 0)',
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Thumbnail with isolated photo or emoji */}
              <div className="relative flex-shrink-0">
                <IngredientThumbnail name={ing.name} size={42} className="rounded-xl shadow-xs" />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xs">
                  <Star size={8} className="fill-white text-white" />
                </div>
              </div>

              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] capitalize truncate max-w-[110px]">
                    {ing.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[var(--accent-text-on-light)]">
                  {ing.quantity}
                </span>
                <span className="text-[9px] font-medium tracking-wide uppercase text-[var(--text-secondary)]">
                  Required Now
                </span>
              </div>
            </motion.div>
          ))}

          {/* Secondary / other ingredients */}
          {others.map((ing) => (
            <motion.div
              layout
              key={`oth-${ing.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0 flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-white/60 dark:bg-[var(--bg-card)]/50 border border-stone-200/80 dark:border-white/5 opacity-65 hover:opacity-100 transition-opacity select-none"
            >
              <IngredientThumbnail name={ing.name} size={30} className="rounded-lg opacity-80" />
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 capitalize truncate max-w-[90px]">
                  {ing.name}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {ing.quantity}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
