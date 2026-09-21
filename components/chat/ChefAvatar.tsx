'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, HelpCircle, Star, Flame, Lightbulb, type LucideIcon } from 'lucide-react'
import { ChefMood } from '@/lib/chefMiseEngine'

interface ChefAvatarProps {
  mood?: ChefMood
  size?: 'sm' | 'md' | 'lg'
  isSpeaking?: boolean
  className?: string
}

export function ChefAvatar({
  mood = 'happy',
  size = 'md',
  isSpeaking = false,
  className = '',
}: ChefAvatarProps) {
  // Dimensions map
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
  }

  const iconSizes = {
    sm: 15,
    md: 20,
    lg: 28,
  }

  // Mood expressions & labels
  const moodMap: Record<ChefMood, { icon: LucideIcon; label: string; glow: string; color: string }> = {
    happy: { icon: ChefHat, label: 'Chef Mise', glow: 'from-[var(--accent)]/30 to-[var(--accent)]/10', color: 'text-[var(--accent)]' },
    thinking: { icon: HelpCircle, label: 'Thinking...', glow: 'from-[var(--accent)]/20 to-[var(--accent)]/10', color: 'text-[var(--text-secondary)]' },
    celebrating: { icon: Star, label: 'Great Pick!', glow: 'from-[var(--success)]/30 to-[var(--success)]/10', color: 'text-[var(--success)]' },
    cooking: { icon: Flame, label: 'Cooking Mode', glow: 'from-[var(--accent)]/30 to-[var(--accent)]/10', color: 'text-[var(--accent)]' },
    helpful: { icon: Lightbulb, label: 'Chef Tip', glow: 'from-[var(--accent)]/30 to-[var(--accent)]/10', color: 'text-[var(--accent)]' },
  }

  const currentMood = moodMap[mood] || moodMap.happy

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Animated subtle halo aura glow */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.22, 1] : [1, 1.08, 1],
          opacity: isSpeaking ? [0.6, 0.9, 0.6] : [0.35, 0.55, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking ? 1.4 : 3.2,
          ease: 'easeInOut',
        }}
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentMood.glow} blur-md -z-10`}
      />

      {/* Main Avatar Circle */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeMap[size]} rounded-full bg-[var(--accent)] text-white flex items-center justify-center relative overflow-hidden border border-white/20`}
      >
        <ChefHat size={iconSizes[size]} className="drop-shadow-xs" />

        {/* Dynamic expression badge overlay */}
        <AnimatePresence mode="wait">
          <motion.span
            key={mood}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--bg-card)] flex items-center justify-center shadow-xs border border-[var(--bg-card-border)]"
          >
            <currentMood.icon size={9} className={currentMood.color} strokeWidth={2.5} />
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
