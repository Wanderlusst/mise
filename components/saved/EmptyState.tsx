'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, ChefHat } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'

export function EmptyState() {
  const haptic = useHaptic()

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center select-none"
    >
      {/* ── Gentle Floating Illustration ── */}
      <div className="relative mb-7">
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-[130px] h-[130px] rounded-[38px] flex items-center justify-center
                     bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs"
        >
          <BookOpen size={54} className="text-[var(--accent)]" strokeWidth={1.5} />

          {/* Floating mini badge */}
          <div
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center
                       bg-[var(--accent)] text-white shadow-sm"
          >
            <ChefHat size={15} strokeWidth={2.4} />
          </div>
        </motion.div>

        {/* Ambient Warm Atmosphere Glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none bg-[var(--accent)]/15"
          style={{
            transform: 'scale(1.4)',
          }}
        />
      </div>

      {/* ── Header Message ── */}
      <h3 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight mb-2 font-apple">
        Your cookbook is empty.
      </h3>

      <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[280px] font-medium">
        Start saving recipes you love to build your personal culinary collection.
      </p>

      {/* ── CTA: Explore Recipes ── */}
      <Link href="/mobile" id="empty-explore-cta" onClick={() => haptic(10)}>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-full font-apple font-bold text-[15px] text-white
                     cursor-pointer select-none bg-[var(--accent)] shadow-sm hover:opacity-95"
        >
          <BookOpen size={17} strokeWidth={2.2} />
          <span>Explore Recipes</span>
        </motion.div>
      </Link>
    </motion.div>
  )
}
