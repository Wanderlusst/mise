'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.1 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      {/* Illustration blob */}
      <div className="relative mb-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[120px] h-[120px] rounded-[36px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,163,113,0.18) 0%, rgba(255,163,113,0.08) 100%)',
            boxShadow: '0 8px 32px rgba(255, 163, 113, 0.16)',
          }}
        >
          <span className="text-[52px] leading-none select-none">🍽️</span>
        </motion.div>

        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(255, 163, 113, 0.12)', transform: 'scale(1.4)' }}
        />
      </div>

      <h3 className="text-[22px] font-bold text-stone-800 dark:text-white tracking-tight mb-2 font-apple">
        No saved recipes yet
      </h3>
      <p className="text-[14px] text-stone-400 dark:text-stone-500 leading-relaxed mb-8 max-w-[240px]">
        Recipes you bookmark will appear here, ready to cook any time.
      </p>

      <Link href="/mobile" id="empty-explore-cta">
        <motion.div
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-[14px] text-white font-sans"
          style={{
            background: 'linear-gradient(135deg, #ffa371 0%, #f58042 100%)',
            boxShadow: '0 4px 20px rgba(255, 163, 113, 0.38)',
          }}
        >
          <BookOpen size={16} strokeWidth={2} />
          Explore Recipes
        </motion.div>
      </Link>
    </motion.div>
  )
}
