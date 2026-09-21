'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Heart, ShieldAlert, BookOpen, Utensils } from 'lucide-react'
import { ChefAvatar } from './ChefAvatar'
import { useSettings } from '@/lib/useSettings'
import { useSavedRecipes } from '@/lib/useSavedRecipes'

interface ChefHeroProps {
  onQuickPrompt?: (prompt: string) => void
}

export function ChefHero({ onQuickPrompt }: ChefHeroProps) {
  const { settings } = useSettings()
  const { saved } = useSavedRecipes()

  // Generate personalized memory chips
  const memoryTags: string[] = []
  if (settings.diet && settings.diet !== 'all') {
    memoryTags.push(settings.diet.toUpperCase())
  }
  if (settings.allergies && settings.allergies.length > 0) {
    memoryTags.push(`No ${settings.allergies.join(', ')}`)
  }
  if (saved.length > 0) {
    memoryTags.push(`${saved.length} Saved Recipes`)
  }
  if (settings.pantryStaples && settings.pantryStaples.length > 0) {
    memoryTags.push(`${settings.pantryStaples.length} Pantry Staples`)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-5 w-full min-w-0"
    >
      {/* Top Identity & Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs">
          <ChefAvatar mood="happy" size="sm" />
          <span className="text-[11.5px] font-bold text-[var(--text-primary)] tracking-tight">
            Chef Mise
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse ml-0.5" />
          <span className="text-[10px] font-medium text-[var(--text-secondary)]">
            Online Sous Chef
          </span>
        </div>

        {/* Personalized Active Memory Tag */}
        {memoryTags.length > 0 && (
          <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/20 text-[10.5px] font-semibold text-[var(--accent-text-on-light)]">
            <ChefHat size={11} />
            <span>Personalized</span>
          </div>
        )}
      </div>

      {/* Hero Title & Subheading */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs">
        {/* Warm decorative background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-[28px] font-bold text-[var(--text-primary)] font-apple tracking-tight leading-tight">
              Meet Chef Mise
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Your personal kitchen companion. Tell me what you have, how tired you are, or what you crave.
            </p>
          </div>

          <div className="shrink-0 pt-0.5">
            <ChefAvatar mood="cooking" size="md" />
          </div>
        </div>

        {/* Memory Pill Bar */}
        {memoryTags.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-[var(--bg-card-border)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <ChefHat size={10} className="text-[var(--accent)]" /> Remembering:
            </span>
            {memoryTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-[10.5px] font-medium text-[var(--text-primary)] whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.header>
  )
}
