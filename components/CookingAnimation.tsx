'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Sparkles, Flame, UtensilsCrossed, type LucideIcon } from 'lucide-react'

const CHEF_STEPS: Array<{ icon: LucideIcon; text: string }> = [
  { icon: Flame, text: "Heating up the chef's station…" },
  { icon: Sparkles, text: 'Chopping fresh aromatics & herbs…' },
  { icon: ChefHat, text: 'Sizzling & balancing flavors…' },
  { icon: Sparkles, text: 'Infusing spices & simmering…' },
  { icon: UtensilsCrossed, text: 'Plating your signature recipe…' },
]

const INGREDIENT_PARTICLES = [
  { delay: 0.1, x: -38, y: -20, color: 'bg-emerald-400' },
  { delay: 0.4, x: 34, y: -28, color: 'bg-amber-300' },
  { delay: 0.7, x: -22, y: -34, color: 'bg-[var(--accent)]' },
  { delay: 1.0, x: 26, y: -16, color: 'bg-red-400' },
  { delay: 1.3, x: -8, y: -40, color: 'bg-orange-400' },
  { delay: 1.6, x: 12, y: -36, color: 'bg-yellow-300' },
]

interface CookingAnimationProps {
  ingredientsCount?: number
  isDark?: boolean
}

export function CookingAnimation({ ingredientsCount = 0, isDark = false }: CookingAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % CHEF_STEPS.length)
    }, 1600)
    return () => clearInterval(timer)
  }, [])

  const current = CHEF_STEPS[stepIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-hidden select-none"
      style={{
        background: 'var(--bg-page)',
      }}
    >
      {/* ── Ambient Floating Glows ── */}
      <motion.div
        className="absolute w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Center Culinary Stage ── */}
      <div className="relative flex flex-col items-center">
        {/* Steam Waves Rising */}
        <div className="relative w-32 h-14 flex justify-center items-end gap-3 mb-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full"
              style={{
                height: 24,
                background: 'linear-gradient(to top, var(--accent), transparent)',
              }}
              animate={{
                y: [-6, -26],
                opacity: [0, 0.8, 0],
                scaleX: [1, 1.6, 1],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Floating Ingredients Tossing Up from the Skillet */}
          {INGREDIENT_PARTICLES.map((p, idx) => (
            <motion.span
              key={idx}
              className={`absolute w-2.5 h-2.5 rounded-full ${p.color} pointer-events-none shadow-sm blur-[0.5px]`}
              animate={{
                x: [0, p.x, 0],
                y: [10, p.y, 10],
                opacity: [0, 0.95, 0],
                scale: [0.6, 1.4, 0.7],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* ── Sizzling Pan & Burner ── */}
        <div className="relative flex items-center justify-center">
          {/* Sizzling Skillet */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{
              rotate: [-2.5, 2.5, -2.5],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Pan body */}
            <div
              className="w-24 h-11 rounded-b-[28px] rounded-t-[10px] relative flex items-center justify-center shadow-lg"
              style={{
                background: 'var(--bg-banner)',
                border: '2px solid var(--accent)',
                boxShadow: isDark
                  ? '0 12px 28px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)'
                  : '0 12px 28px rgba(78,44,23,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
              }}
            >
              {/* Pan rim inner shimmer */}
              <div
                className="w-20 h-4 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-text-on-light) 50%, var(--accent) 100%)',
                  opacity: 0.85,
                  filter: 'blur(1px)',
                }}
              />
            </div>

            {/* Pan Handle */}
            <div
              className="w-10 h-3.5 rounded-r-md -ml-0.5 origin-left"
              style={{
                background: 'linear-gradient(90deg, #261f1b 0%, #8c5d39 40%, #c48b57 100%)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          </motion.div>

          {/* Glowing Flame Under Skillet */}
          <motion.div
            className="absolute -bottom-3 flex items-center gap-1"
            animate={{
              scale: [0.95, 1.1, 0.95],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Flame size={18} className="text-amber-500 fill-amber-500" />
            <Flame size={22} className="text-orange-500 fill-orange-500 -mt-1" />
            <Flame size={18} className="text-amber-500 fill-amber-500" />
          </motion.div>
        </div>
      </div>

      {/* ── Status Text and Step Message ── */}
      <div className="mt-10 flex flex-col items-center text-center max-w-xs z-10">
        {/* Ingredient Count Badge */}
        {ingredientsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 font-mono"
            style={{
              background: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid var(--success)',
            }}
          >
            <ChefHat size={13} strokeWidth={2} />
            <span>Matching {ingredientsCount} fresh ingredients</span>
          </motion.div>
        )}

        {/* Animated Step Heading */}
        <div className="h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={current.text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="text-[17px] font-bold tracking-tight flex items-center justify-center gap-2"
              style={{
                color: 'var(--text-primary)',
              }}
            >
              <current.icon size={18} className="text-[var(--accent)]" strokeWidth={2.2} />
              <span>{current.text}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <p
          className="text-xs font-medium mt-1 max-w-[240px] leading-relaxed"
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(28,25,23,0.55)' }}
        >
          Our AI chef is pairing authentic spices, textures, and cooking techniques for your haul.
        </p>

        {/* Progress Shimmer Bar */}
        <div
          className="w-48 h-1.5 rounded-full overflow-hidden mt-5 relative"
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-text-on-light) 50%, var(--accent) 100%)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  )
}
