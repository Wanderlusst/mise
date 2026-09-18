'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { FloatingNav } from '@/components/FloatingNav'
import { CategoryFilter } from '@/components/saved/CategoryFilter'
import { SavedRecipeCard } from '@/components/saved/SavedRecipeCard'
import { EmptyState } from '@/components/saved/EmptyState'
import { useSavedRecipes, type SavedCategory } from '@/lib/useSavedRecipes'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'

// ─── Stagger container ─────────────────────────────────────────────────────────
const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SavedPage() {
  const { saved, unsave } = useSavedRecipes()
  const { settings } = useSettings()
  const isDark = settings.theme === 'dark'
  const haptic = useHaptic()

  const [activeCategory, setActiveCategory] = useState<SavedCategory>('All')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCategorySelect = (cat: SavedCategory) => {
    haptic(8)
    setActiveCategory(cat)
  }

  // ── Derived filtered list ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = saved
    if (activeCategory !== 'All') {
      list = list.filter((r) => r.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q))
    }
    return list
  }, [saved, activeCategory, searchQuery])

  const totalSaved = saved.length

  return (
      <main className="relative z-10 min-h-screen w-full max-w-mobile mx-auto flex flex-col pb-36">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="flex items-center justify-between px-5 pt-14 pb-6"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-[30px] font-bold tracking-tight text-stone-900 dark:text-white font-apple">
              Saved Recipes
            </h1>
            {/* Count badge */}
            {totalSaved > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.2 }}
                className="min-w-[28px] h-7 rounded-full px-2 flex items-center justify-center
                           text-[13px] font-bold text-white font-sans"
                style={{
                  background: '#ffa371',
                  boxShadow: '0 2px 10px rgba(255, 163, 113, 0.38)',
                }}
              >
                {totalSaved}
              </motion.div>
            )}
          </div>

          {/* Search icon */}
          <motion.button
            id="saved-search-btn"
            aria-label="Search saved recipes"
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              haptic(10)
              setSearchOpen((p) => !p)
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center outline-none
                       border transition-colors duration-200"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              backdropFilter: 'blur(12px)',
              color: isDark ? '#ffa371' : '#374151',
            }}
          >
            <Search size={18} strokeWidth={2} />
          </motion.button>
        </motion.header>

        {/* ── Search Bar (expandable) ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="px-5 mb-4 overflow-hidden"
            >
              <div className="glass-input">
                <Search size={16} strokeWidth={1.8} className="text-stone-400 flex-shrink-0" />
                <input
                  id="saved-search-input"
                  type="text"
                  placeholder="Search saved recipes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-stone-400
                             dark:placeholder:text-stone-500 text-stone-900 dark:text-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Category Filter ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mb-7"
        >
          <CategoryFilter active={activeCategory} onSelect={handleCategorySelect} />
        </motion.div>

        {/* ── Section Header ── */}
        <div className="flex items-center justify-between px-5 mb-4">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14, type: 'spring', stiffness: 380, damping: 28 }}
            className="flex items-center gap-2.5"
          >
            <h2 className="text-[20px] font-bold text-stone-900 dark:text-white font-apple tracking-tight">
              {activeCategory === 'All' ? 'All Recipes' : activeCategory}
            </h2>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={filtered.length}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="text-[13px] font-semibold px-2 py-0.5 rounded-full text-stone-500 dark:text-stone-400
                           bg-stone-100 dark:bg-white/[0.07]"
              >
                {filtered.length}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Cards List or Empty State ── */}
        <div className="px-5 flex-1">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              <motion.div
                key={activeCategory + searchQuery}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-4"
              >
                {filtered.map((recipe, i) => (
                  <SavedRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onUnsave={unsave}
                    animDelay={i * 0.07}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
  )
}
