'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MOOD_OPTIONS, CookingMood } from '@/lib/homeData'
import { useHaptic } from '@/lib/useHaptic'
import { Moon, Smile, Crown, Leaf, Flame, Coins } from 'lucide-react'

const MOOD_ICONS: Record<string, React.ReactNode> = {
  moon: <Moon size={13} strokeWidth={2.2} />,
  smile: <Smile size={13} strokeWidth={2.2} />,
  crown: <Crown size={13} strokeWidth={2.2} />,
  leaf: <Leaf size={13} strokeWidth={2.2} />,
  flame: <Flame size={13} strokeWidth={2.2} />,
  coins: <Coins size={13} strokeWidth={2.2} />,
}

interface MoodSelectorProps {
  selectedMood: CookingMood | null
  onSelectMood: (mood: CookingMood | null) => void
}

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  const haptic = useHaptic()

  const handleSelect = (moodId: CookingMood) => {
    haptic(10)
    // Tapping the active mood toggles it off back to null (or normal)
    if (selectedMood === moodId) {
      onSelectMood(null)
    } else {
      onSelectMood(moodId)
    }
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            How are you feeling?
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--text-secondary)] font-medium">
            Optional
          </span>
        </div>

        {selectedMood && (
          <button
            type="button"
            onClick={() => {
              haptic(8)
              onSelectMood(null)
            }}
            className="text-[11px] font-semibold text-[var(--accent-text-on-light)] hover:opacity-80 transition-opacity"
          >
            Reset
          </button>
        )}
      </div>

      {/* Horizontally scrollable pill container */}
      <div className="relative -mx-5 px-5">
        <div
          role="radiogroup"
          aria-label="Select cooking mood"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-px-5 snap-x"
        >
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMood === mood.id

            return (
              <motion.button
                key={mood.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleSelect(mood.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 snap-start select-none outline-none ${
                  isSelected
                    ? 'text-white'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--bg-card-border)] hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {/* Framer Motion shared layout indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="activeMoodPill"
                    className="absolute inset-0 rounded-full bg-[var(--accent)] shadow-sm -z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <span
                  className={`relative z-10 flex items-center justify-center shrink-0 ${
                    isSelected ? 'text-white' : 'text-[var(--accent)]'
                  }`}
                >
                  {MOOD_ICONS[mood.icon]}
                </span>
                <span className="relative z-10 tracking-tight">{mood.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
