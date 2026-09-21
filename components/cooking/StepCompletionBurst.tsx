'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StepCompletionBurstProps {
  active: boolean
  x?: number
  y?: number
  onComplete?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  scale: number
  rotation: number
  color: string
  size: number
  isPill: boolean
}

const CULINARY_PALETTE = [
  '#D9713C', // Accent coral
  '#3E7A54', // Success green
  '#E4F0E7', // Success bg
  '#A6512A', // Dark accent
  '#FFFDF8', // Card cream
  '#F7F2E9', // Page warm off-white
]

export default function StepCompletionBurst({
  active,
  x = 0,
  y = 0,
  onComplete,
}: StepCompletionBurstProps) {
  // Generate particles on active state
  const particles = useMemo<Particle[]>(() => {
    if (!active) return []

    const count = 16
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4
      const distance = 36 + Math.random() * 48
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 8, // slight upward bias
        scale: 0.6 + Math.random() * 0.7,
        rotation: Math.random() * 360,
        color: CULINARY_PALETTE[i % CULINARY_PALETTE.length],
        size: 5 + Math.random() * 4,
        isPill: i % 3 === 0,
      }
    })
  }, [active])

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-30">
      <AnimatePresence onExitComplete={onComplete}>
        {active && (
          <>
            {/* Subtle Expanding Success Shockwave */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-14 h-14 rounded-full border-2 border-[#6E7F4A]/60 pointer-events-none"
            />

            {/* Micro Confetti Burst */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, p.scale, p.scale * 0.7],
                  opacity: [1, 1, 0],
                  rotate: p.rotation,
                }}
                transition={{
                  duration: 0.65 + Math.random() * 0.2,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="absolute pointer-events-none"
                style={{
                  width: p.isPill ? p.size * 1.8 : p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.isPill ? 999 : p.id % 2 === 0 ? '50%' : 2,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Animated SVG Checkmark that draws smoothly from left to right (Stripe/Apple style)
 */
export function AnimatedCheckmark({
  size = 18,
  strokeWidth = 2.5,
  color = '#ffffff',
  className = '',
}: {
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <motion.path
        d="M20 6L9 17L4 12"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.38, ease: 'easeOut', delay: 0.05 }}
      />
    </svg>
  )
}
