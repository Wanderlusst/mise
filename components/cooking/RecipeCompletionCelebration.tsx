'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Clock,
  CheckCircle2,
  Utensils,
  Bookmark,
  RotateCcw,
  Share2,
  Flame,
  ChefHat,
  Compass,
  Ticket,
  Check,
  Home,
  X,
} from 'lucide-react'
import { playChime } from './soundUtils'
import { useHaptic } from '@/lib/useHaptic'
import { useSavedRecipes } from '@/lib/useSavedRecipes'

interface RecipeCompletionCelebrationProps {
  recipe: {
    id: string
    name: string
    time_minutes: number
    servings: number
    ingredients: Array<{ name: string; quantity: string }>
    steps: Array<{ id: string; instruction: string }>
    image_url?: string
  }
  elapsedSeconds?: number
  onExit?: () => void
  onCookAgain: () => void
  onViewSimilar: () => void
  onViewTicket?: () => void
  className?: string
}

// Full celebration confetti particles
function CelebrationConfetti() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: (i / 28) * 100, // percentage across screen width
    delay: Math.random() * 0.8,
    duration: 2.2 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    color: ['var(--accent)', 'var(--success)', 'var(--accent)', 'var(--success)', 'var(--accent)', 'var(--success)'][i % 6],
    rotation: Math.random() * 720 - 360,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: '105vh',
            x: `${p.x + (Math.random() - 0.5) * 15}vw`,
            opacity: [1, 1, 0.8, 0],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        />
      ))}
    </div>
  )
}

export default function RecipeCompletionCelebration({
  recipe,
  elapsedSeconds = 0,
  onExit,
  onCookAgain,
  onViewSimilar,
  onViewTicket,
  className = '',
}: RecipeCompletionCelebrationProps) {
  const router = useRouter()
  const haptic = useHaptic()
  const { isSaved, toggleSave } = useSavedRecipes()
  const [copiedToast, setCopiedToast] = useState(false)
  const saved = isSaved(recipe.id)

  const handleExit = () => {
    haptic(15)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mise_active_cooking_v1')
      window.dispatchEvent(new Event('mise_active_cooking_changed'))
    }
    if (onExit) {
      onExit()
    } else {
      router.push('/mobile')
    }
  }

  // Play triumph sound and haptics on mount
  useEffect(() => {
    playChime('success')
    haptic([40, 100, 40, 100, 60])
  }, [haptic])

  const actualMinutes = Math.max(
    1,
    elapsedSeconds > 60 ? Math.round(elapsedSeconds / 60) : recipe.time_minutes
  )

  const handleSaveToggle = () => {
    haptic(15)
    toggleSave({
      id: recipe.id,
      name: recipe.name,
      image: recipe.image_url || '/food/bowl.jpg',
      time: recipe.time_minutes,
      difficulty: 'Easy',
      calories: 450,
      category: 'All',
      diet: 'veg',
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      steps: recipe.steps.map((s, idx) => ({
        id: s.id || `step-${idx}`,
        step_order: idx + 1,
        instruction: s.instruction,
        duration_minutes: null,
        parallel: false,
      })),
    })
  }

  const handleShare = async () => {
    haptic(10)
    const shareData = {
      title: `I just cooked ${recipe.name}!`,
      text: `Just made ${recipe.name} with Mise! It turned out incredible.`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(
          `Just cooked ${recipe.name} with Mise in ${actualMinutes} minutes!\nCheck it out: ${window.location.href}`
        )
        setCopiedToast(true)
        setTimeout(() => setCopiedToast(false), 2400)
      } catch {
        // Clipboard failed
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-center select-none ${className}`}
    >
      <CelebrationConfetti />

      {/* ── Quick Close/Exit Button ── */}
      <button
        type="button"
        onClick={handleExit}
        aria-label="Exit and return to kitchen"
        className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[var(--bg-page)] border border-[var(--bg-card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] active:scale-90 transition-all cursor-pointer shadow-2xs"
      >
        <X size={16} strokeWidth={2.2} />
      </button>

      {/* ── Radiant light aura ── */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Trophy Reveal ── */}
      <div className="relative z-10 flex flex-col items-center mb-5">
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
          className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-[var(--accent)] shadow-xl mb-4"
        >
          <Trophy size={38} className="text-white drop-shadow-md" strokeWidth={2} />
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--bg-card)] shadow-sm flex items-center justify-center"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame size={13} className="text-[var(--accent)]" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-apple font-extrabold text-[var(--text-primary)] tracking-tight mb-1"
        >
          Recipe Completed!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-[var(--text-secondary)] max-w-xs"
        >
          Flawlessly executed. Savor every bite of your{' '}
          <span className="font-semibold text-[var(--accent)]">
            {recipe.name}
          </span>
          .
        </motion.p>
      </div>

      {/* ── Statistics Grid (Apple Fitness Style) ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 grid grid-cols-3 gap-2.5 mb-6"
      >
        {/* Stat 1: Total Time */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)]">
          <Clock size={16} className="text-[var(--accent)] mb-1" />
          <span className="text-base font-mono font-bold text-[var(--text-primary)] tabular-nums">
            {actualMinutes}m
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-secondary)]">
            Total Time
          </span>
        </div>

        {/* Stat 2: Steps Completed */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)]">
          <CheckCircle2 size={16} className="text-[var(--success)] mb-1" />
          <span className="text-base font-mono font-bold text-[var(--text-primary)] tabular-nums">
            {recipe.steps.length}/{recipe.steps.length}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-secondary)]">
            Steps Done
          </span>
        </div>

        {/* Stat 3: Ingredients Used */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)]">
          <Utensils size={16} className="text-[var(--accent)] mb-1" />
          <span className="text-base font-mono font-bold text-[var(--text-primary)] tabular-nums">
            {recipe.ingredients.length}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-secondary)]">
            Ingredients
          </span>
        </div>
      </motion.div>

      {/* ── Mastery Badge ── */}
      <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] border border-[var(--accent)]/30 text-xs font-semibold mb-6">
        <ChefHat size={13} />
        <span>Achievement Unlocked: Culinary Precision</span>
      </div>

      {/* ── Action Buttons ── */}
      <div className="relative z-10 flex flex-col gap-2.5 max-w-xs mx-auto">
        {/* Row 0: Exit & Finish (Primary Action) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleExit}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-full font-apple font-bold text-sm shadow-md transition-all cursor-pointer bg-[var(--accent)] text-white hover:opacity-95"
        >
          <Home size={17} strokeWidth={2} />
          <span>Done • Return to Kitchen</span>
        </motion.button>

        {/* Row 1: Save Recipe */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSaveToggle}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-full font-apple font-semibold text-xs transition-all cursor-pointer"
          style={{
            background: saved
              ? 'var(--success-bg)'
              : 'var(--bg-page)',
            color: saved ? 'var(--success)' : 'var(--text-primary)',
            border: `1.5px solid ${saved ? 'var(--success)' : 'var(--bg-card-border)'}`,
          }}
        >
          {saved ? (
            <>
              <Check size={16} strokeWidth={2.5} />
              <span>Saved to Cookbook</span>
            </>
          ) : (
            <>
              <Bookmark size={16} />
              <span>Save Recipe</span>
            </>
          )}
        </motion.button>

        {/* Row 2: Cook Again & Share */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCookAgain}
            className="flex items-center justify-center gap-1.5 h-11 rounded-full bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--bg-card-border)] text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Cook Again</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 h-11 rounded-full bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--bg-card-border)] text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Share2 size={14} />
            <span>Share</span>
          </motion.button>
        </div>

        {/* Row 3: Similar Recipes & Ticket */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <button
            onClick={onViewSimilar}
            className="text-xs font-semibold text-[var(--accent-text-on-light)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Compass size={13} />
            <span>View Similar Recipes</span>
          </button>

          {onViewTicket && (
            <>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <button
                onClick={onViewTicket}
                className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Ticket size={13} />
                <span>Kitchen Ticket</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Copied toast notification */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-medium shadow-lg z-30 flex items-center gap-1.5"
          >
            <Check size={12} className="text-[var(--success)]" />
            <span>Recipe copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
