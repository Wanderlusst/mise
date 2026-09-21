'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import {
  MiseSearchIcon,
  MiseChefHatIcon,
  MiseCheckCircleIcon,
} from '@/components/icons/MiseIcons'
import Link from 'next/link'
import { CategoryFilter } from '@/components/saved/CategoryFilter'
import { SavedRecipeCard } from '@/components/saved/SavedRecipeCard'
import { RecipeCollectionsShelf } from '@/components/saved/RecipeCollections'
import { EmptyState } from '@/components/saved/EmptyState'
import {
  useSavedRecipes,
  useScannedPantry,
  computeRecipeCookingInsight,
  type SavedCategory,
  type SavedRecipe,
} from '@/lib/useSavedRecipes'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'

export default function SavedPage() {
  const { saved, unsave, toggleFavorite, isLoaded } = useSavedRecipes()
  const { pantry } = useScannedPantry()
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

  // ── Compute Ready-to-cook recipes from scanned pantry ──────────────────────
  const readyToCookRecipes = useMemo(() => {
    return saved.filter((r) => {
      const insight = computeRecipeCookingInsight(r, pantry)
      return insight.isReadyToCook
    })
  }, [saved, pantry])

  // ── Curated collection shelves for 'All' view ──────────────────────────────
  const recentlyCookedRecipes = useMemo(() => {
    return saved.filter((r) => (r.timesCooked && r.timesCooked > 0) || r.lastCooked)
  }, [saved])

  const quickMealRecipes = useMemo(() => {
    return saved.filter((r) => r.time <= 15)
  }, [saved])

  // ── Compute Category Counts for the category pills ─────────────────────────
  const categoryCounts = useMemo<Partial<Record<SavedCategory, number>>>(() => {
    const counts: Partial<Record<SavedCategory, number>> = {
      All: saved.length,
      Favorites: saved.filter((r) => r.isFavorite || (r.tags && r.tags.includes('Favorites'))).length,
      'Recently Cooked': recentlyCookedRecipes.length,
      'Ready To Cook': readyToCookRecipes.length,
      'Want To Cook': saved.filter((r) => r.wantToCook || (r.tags && r.tags.includes('Want To Cook'))).length,
      'Top Recipes': saved.filter((r) => (r.timesCooked && r.timesCooked >= 10) || r.badge === 'Most Cooked').length,
      Healthy: saved.filter((r) => r.category === 'Healthy' || (r.tags && r.tags.includes('Healthy'))).length,
      'Comfort Food': saved.filter((r) => r.category === 'Comfort Food' || (r.tags && r.tags.includes('Comfort Food'))).length,
      Desserts: saved.filter((r) => r.category === 'Desserts' || (r.tags && r.tags.includes('Desserts'))).length,
    }
    return counts
  }, [saved, recentlyCookedRecipes, readyToCookRecipes])

  // ── Filtered list based on active category & search query ──────────────────
  const filtered = useMemo(() => {
    let list = saved

    if (activeCategory === 'Favorites') {
      list = list.filter((r) => r.isFavorite || (r.tags && r.tags.includes('Favorites')))
    } else if (activeCategory === 'Recently Cooked') {
      list = list.filter((r) => (r.timesCooked && r.timesCooked > 0) || r.lastCooked)
    } else if (activeCategory === 'Ready To Cook') {
      list = list.filter((r) => {
        const insight = computeRecipeCookingInsight(r, pantry)
        return insight.isReadyToCook
      })
    } else if (activeCategory === 'Want To Cook') {
      list = list.filter((r) => r.wantToCook || (r.tags && r.tags.includes('Want To Cook')))
    } else if (activeCategory === 'Top Recipes') {
      list = list.filter((r) => (r.timesCooked && r.timesCooked >= 10) || r.badge === 'Most Cooked' || (r.tags && r.tags.includes('Top Recipes')))
    } else if (activeCategory === 'Healthy') {
      list = list.filter((r) => r.category === 'Healthy' || (r.tags && r.tags.includes('Healthy')))
    } else if (activeCategory === 'Comfort Food') {
      list = list.filter((r) => r.category === 'Comfort Food' || (r.tags && r.tags.includes('Comfort Food')))
    } else if (activeCategory === 'Desserts') {
      list = list.filter((r) => r.category === 'Desserts' || (r.tags && r.tags.includes('Desserts')))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(q)
        const tagMatch = r.tags ? r.tags.some((t) => t.toLowerCase().includes(q)) : false
        const ingMatch = r.ingredients ? r.ingredients.some((i) => i.name.toLowerCase().includes(q)) : false
        return nameMatch || tagMatch || ingMatch
      })
    }

    return list
  }, [saved, activeCategory, searchQuery, pantry])

  const totalSaved = saved.length

  return (
    <main className="relative z-10 min-h-screen w-full max-w-mobile mx-auto flex flex-col pb-36 select-none">
      {/* ── Header Redesign ── */}
      <header
        className="px-5 pt-12 pb-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-tight text-[var(--text-primary)] font-apple leading-tight">
              Saved Recipes
            </h1>
            <p className="text-[15px] font-medium text-[var(--text-secondary)] mt-0.5">
              Your personal cookbook
            </p>

            {/* Elegant Badge: Recipes Saved */}
            <div className="flex items-center gap-2 mt-2.5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold text-white shadow-sm bg-[var(--accent)]"
              >
                <MiseChefHatIcon size={13} strokeWidth={2.2} />
                <span suppressHydrationWarning>
                  {isLoaded
                    ? `${totalSaved} ${totalSaved === 1 ? 'Recipe Saved' : 'Recipes Saved'}`
                    : 'Cookbook'}
                </span>
              </span>

              {isLoaded && readyToCookRecipes.length > 0 && (
                <span
                  onClick={() => handleCategorySelect('Ready To Cook')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold
                             bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/20 cursor-pointer
                             hover:opacity-90 transition-opacity"
                >
                  <MiseCheckCircleIcon size={12} strokeWidth={2.2} />
                  <span>{readyToCookRecipes.length} Ready To Cook</span>
                </span>
              )}
            </div>
          </div>

          {/* Floating Circular Search Button with Glassmorphism */}
          <motion.button
            id="saved-search-btn"
            aria-label="Search saved recipes"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              haptic(10)
              setSearchOpen((p) => !p)
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center outline-none cursor-pointer
                       bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--accent)]
                       shadow-xs transition-all duration-200"
          >
            {searchOpen ? (
              <X size={19} strokeWidth={2.2} />
            ) : (
              <MiseSearchIcon size={19} strokeWidth={2.1} />
            )}
          </motion.button>
        </div>
      </header>

      {/* ── Expandable Luxury Glass Search Bar ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="px-5 mb-4 overflow-hidden"
          >
            <div className="glass-input">
              <MiseSearchIcon size={17} strokeWidth={2.1} className="text-[var(--accent)] flex-shrink-0" />
              <input
                id="saved-search-input"
                type="text"
                placeholder="Search recipes, ingredients, flavors…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--text-secondary)]
                           text-[var(--text-primary)] font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Smart Cooking Insights Banner ── */}
      {readyToCookRecipes.length > 0 && activeCategory !== 'Ready To Cook' && !searchQuery && (
        <div
          className="px-5 mb-5"
        >
          <div
            onClick={() => handleCategorySelect('Ready To Cook')}
            className="p-3.5 rounded-[22px] flex items-center justify-between cursor-pointer
                       border border-[var(--success)]/25 bg-[var(--success-bg)]
                       hover:opacity-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--success)] border border-[var(--bg-card-border)]">
                <MiseChefHatIcon size={20} strokeWidth={2.1} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[var(--text-primary)] font-apple">
                  Ready to cook right now
                </p>
                <p className="text-[12px] font-medium text-[var(--success)]">
                  {readyToCookRecipes.length} dishes match your kitchen stock
                </p>
              </div>
            </div>

            <span className="text-[12px] font-bold text-[var(--success)] bg-[var(--bg-card)] border border-[var(--bg-card-border)] px-3 py-1 rounded-full">
              View
            </span>
          </div>
        </div>
      )}

      {/* ── Category Experience ── */}
      <div
        className="mb-6"
      >
        <CategoryFilter
          active={activeCategory}
          onSelect={handleCategorySelect}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* ── Curated Recipe Shelves (shown on 'All' when not searching) ── */}
      {activeCategory === 'All' && !searchQuery && (
        <>
          {recentlyCookedRecipes.length > 0 && (
            <RecipeCollectionsShelf
              title="Recently Cooked"
              subtitle="Your kitchen favorites ready to cook again"
              recipes={recentlyCookedRecipes}
            />
          )}

          {quickMealRecipes.length > 0 && (
            <RecipeCollectionsShelf
              title="Quick Meals (< 20 min)"
              subtitle="Effortless gourmet dishes for busy moments"
              recipes={quickMealRecipes}
            />
          )}
        </>
      )}

      {/* ── Section Title Row ── */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div
          className="flex items-center gap-2.5"
        >
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] font-apple tracking-tight">
            {activeCategory === 'All' ? 'All Saved Recipes' : activeCategory}
          </h2>

          <span
            suppressHydrationWarning
            className="text-[12px] font-bold px-2 py-0.5 rounded-full text-[var(--text-secondary)]
                       bg-[var(--bg-card)] border border-[var(--bg-card-border)]"
          >
            {isLoaded ? filtered.length : 0}
          </span>
        </div>

        {/* Scan shortcut if pantry is low */}
        <Link href="/mobile/scan" className="text-[12px] font-semibold text-[var(--accent-text-on-light)] hover:underline">
          Scan Ingredients
        </Link>
      </div>

      {/* ── Recipe Cards Gallery or Empty State ── */}
      <div className="px-5 flex-1">
        {!isLoaded ? (
          <div className="flex flex-col gap-4 py-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="w-full h-36 rounded-2xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-5">
            {filtered.map((recipe) => (
              <SavedRecipeCard
                key={recipe.id}
                recipe={recipe}
                pantryItems={pantry}
                onUnsave={unsave}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
