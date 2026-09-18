'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Heart } from 'lucide-react'
import { type SavedRecipe } from '@/lib/useSavedRecipes'
import { useHaptic } from '@/lib/useHaptic'

// ─── Difficulty pills (similar to the reference bar) ──────────────────────────
function DifficultyBar({ difficulty }: { difficulty: SavedRecipe['difficulty'] }) {
  const levels = { Easy: 2, Medium: 3, Hard: 5 } as const
  const filled = levels[difficulty]
  const total = 5

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-medium text-stone-500 dark:text-stone-400">{difficulty}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 500, damping: 30 }}
            className="h-[6px] rounded-full origin-left"
            style={{
              width: '18px',
              backgroundColor: i < filled ? '#ffa371' : 'rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Saved Recipe Card ─────────────────────────────────────────────────────────
interface SavedRecipeCardProps {
  recipe: SavedRecipe
  onUnsave: (id: string) => void
  animDelay?: number
}

export function SavedRecipeCard({ recipe, onUnsave, animDelay = 0 }: SavedRecipeCardProps) {
  const haptic = useHaptic()
  const [heartPop, setHeartPop] = useState(false)

  const handleUnsave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptic(12)
    setHeartPop(true)
    setTimeout(() => {
      onUnsave(recipe.id)
    }, 320)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -10 }}
      transition={{
        delay: animDelay,
        type: 'spring',
        stiffness: 340,
        damping: 28,
      }}
      whileTap={{ scale: 0.975 }}
      className="w-full"
    >
      <Link href={`/mobile/detail/${recipe.id}`} className="block">
        <div
          className="w-full rounded-[28px] overflow-hidden transition-shadow duration-200 cursor-pointer
                     hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          style={{
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 6px rgba(0,0,0,0.04)',
          }}
        >
          {/* ── Top info row ── */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <h3
                className="text-[18px] font-bold text-stone-900 leading-snug tracking-tight font-apple"
                style={{ maxWidth: '220px' }}
              >
                {recipe.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255, 163, 113, 0.18)' }}
                >
                  <Clock size={12} strokeWidth={2.2} style={{ color: '#ffa371' }} />
                </div>
                <span className="text-[13px] font-medium text-stone-500">{recipe.time} min</span>
              </div>
            </div>

            {/* Heart button */}
            <motion.button
              id={`unsave-${recipe.id}`}
              aria-label={`Remove ${recipe.name} from saved`}
              onClick={handleUnsave}
              animate={heartPop ? { scale: [1, 1.5, 0.85, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-10 h-10 rounded-full flex items-center justify-center outline-none flex-shrink-0
                         active:scale-90 transition-transform"
              style={{ background: 'rgba(255, 163, 113, 0.12)' }}
            >
              <Heart
                size={20}
                fill="#ffa371"
                stroke="#ffa371"
                strokeWidth={1.5}
              />
            </motion.button>
          </div>

          {/* ── Large Recipe Image ── */}
          <div className="relative mx-4 rounded-[20px] overflow-hidden"
               style={{ height: '220px' }}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="w-full h-full"
            >
              <Image
                src={recipe.image}
                alt={recipe.name}
                fill
                className="object-cover"
                sizes="(max-width: 400px) 100vw, 380px"
              />
            </motion.div>
          </div>

          {/* ── Bottom stats row ── */}
          <div className="flex items-center justify-between px-5 py-4">
            <DifficultyBar difficulty={recipe.difficulty} />
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-bold text-stone-900 font-sans tabular-nums">
                {recipe.calories}
              </span>
              <span className="text-[12px] font-medium text-stone-400">kcal</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
