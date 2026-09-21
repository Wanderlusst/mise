'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CornerDownRight } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'

interface ContextualFollowUpsProps {
  chips: string[]
  onSelect: (chip: string) => void
  disabled?: boolean
}

export function ContextualFollowUps({
  chips,
  onSelect,
  disabled = false,
}: ContextualFollowUpsProps) {
  const haptic = useHaptic()

  if (!chips || chips.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="mt-3.5 pl-1 space-y-1.5"
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[var(--text-secondary)]">
        <CornerDownRight size={11} className="text-[var(--accent)]" />
        <span>Chef Follow-Ups</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            disabled={disabled}
            onClick={() => {
              haptic(8)
              onSelect(chip)
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--bg-page)] hover:bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--text-primary)] hover:text-[var(--accent)] text-[11px] font-medium transition-colors shadow-xs"
          >
            <span>{chip}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
