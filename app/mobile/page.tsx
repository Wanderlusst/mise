'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Bell,
  BellOff,
  SlidersHorizontal,
  Search,
  Mic,
  Camera,
  Flame,
  Zap,
  Play,
  X,
  ChevronRight,
  Utensils,
  CookingPot,
  Heart,
  ChefHat,
} from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'
import { useActiveCooking } from '@/lib/activeCooking'
import { useAuth } from '@/lib/useAuth'
import { useScannedPantry, useSavedRecipes } from '@/lib/useSavedRecipes'
import { IndianRegion, RecipeMatchView } from '@/lib/recipeTypes'
import { LocationRegionBar } from '@/components/cooking/LocationRegionBar'
import { RegionalRecipeCard } from '@/components/cooking/RegionalRecipeCard'
import { SousChefBanner } from '@/components/cooking/SousChefBanner'
import { VoiceSearchModal } from '@/components/cooking/VoiceSearchModal'

// ── Kitchen & Dietary Filter Sheet ──────────────────────────────────
function FilterSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { settings, updateDiet, updateRegion } = useSettings()
  const haptic = useHaptic()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="filter-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative w-full max-w-mobile mx-auto bg-[var(--bg-card)] rounded-t-[36px] p-6 pb-8 pb-safe shadow-2xl z-10 border-t border-[var(--bg-card-border)] max-h-[88dvh] overflow-y-auto flex flex-col"
          >
            <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full mx-auto mb-5 shrink-0" />

            <div className="flex items-center justify-between mb-5 shrink-0">
              <div>
                <h2 className="text-xl font-apple font-bold text-stone-900 dark:text-white tracking-tight">
                  Taste & Dietary Profile
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Personalize your AI Sous Chef recommendations
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Diet filter */}
            <section className="mb-6 shrink-0">
              <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2.5 uppercase tracking-wider">
                Dietary Preference
              </p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'veg', 'vegan', 'non-veg', 'jain'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      haptic(10)
                      updateDiet(d)
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                      settings.diet === d
                        ? 'bg-[var(--accent)] text-white shadow-sm'
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--bg-card-border)]'
                    }`}
                  >
                    {d === 'all' ? 'All Diets' : d}
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={() => {
                haptic(15)
                onClose()
              }}
              className="w-full h-12 py-3 px-6 rounded-full bg-[var(--accent)] text-white font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mt-1"
            >
              <span>Save & Continue</span>
              <ChevronRight size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Home Screen Component ─────────────────────────────────────
export default function MobileLandingPage() {
  const haptic = useHaptic()
  const { settings, updateRegion, updateDiet } = useSettings()
  const { session: activeSession, clearSession } = useActiveCooking()
  const { user, userId, openSignInSheet } = useAuth()
  const { pantry } = useScannedPantry()
  const { saved } = useSavedRecipes()

  // 1. Regional Recommendation Engine State
  const rawRegion = settings.region
  const selectedRegion: IndianRegion = useMemo(() => {
    if (!rawRegion) return 'Kerala'
    if (rawRegion === 'all') return 'All'
    return rawRegion as IndianRegion
  }, [rawRegion])

  // 2. Mood & Craving Filter
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  // 3. Search & Modals State
  const [filterOpen, setFilterOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifToast, setNotifToast] = useState<string | null>(null)

  // The catalogue and scores both come from /api/match-recipes.
  const [matchedRecipes, setMatchedRecipes] = useState<RecipeMatchView[]>([])
  const [isAIGenerating, setIsAIGenerating] = useState(false)

  useEffect(() => {
    let isCancelled = false
    const controller = new AbortController()

    const timeoutId = setTimeout(async () => {
      try {
        setIsAIGenerating(true)
        const res = await fetch('/api/match-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            region: selectedRegion,
            diet: settings.diet,
            ingredients: pantry.length > 0 ? pantry : undefined,
            pantryStaples: settings.pantryStaples,
          }),
          signal: controller.signal,
        })

        if (res.ok) {
          const data = await res.json()
          if (!isCancelled && Array.isArray(data.recipes)) {
            setMatchedRecipes(data.recipes)
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[AI Sous Chef Background] Non-blocking enrichment:', err)
        }
      } finally {
        if (!isCancelled) setIsAIGenerating(false)
      }
    }, 350)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [selectedRegion, settings.diet, pantry, settings.pantryStaples])

  // Mood options for quick vibe selection
  const moodFilters = [
    { id: 'quick', label: '⚡ Quick & Light' },
    { id: 'comfort', label: '🍛 Comfort Food' },
    { id: 'spicy', label: '🌶️ Spicy Craving' },
    { id: 'healthy', label: '🌿 Fresh & Clean' },
    { id: 'treat', label: '👑 Indulgent' },
  ]

  // Compute 4 Horizontally Scrollable Sections (Instantly filtered + AI enriched)
  const recipesByTier = useMemo(() => ({
    '5m': matchedRecipes.filter((r) => r.timeMinutes <= 5),
    '15m': matchedRecipes.filter((r) => r.timeMinutes > 5 && r.timeMinutes <= 15),
    '30m': matchedRecipes.filter((r) => r.timeMinutes > 15 && r.timeMinutes <= 30),
    weekend: matchedRecipes.filter((r) => r.timeMinutes > 30),
  }), [matchedRecipes])

  // Filter with active search term if user types in search bar
  const filterBySearch = (list: RecipeMatchView[]) => {
    if (!searchVal.trim()) return list
    const q = searchVal.toLowerCase().trim()
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.regionalName?.toLowerCase().includes(q) ||
        r.allIngredients?.some((i) => i.name.toLowerCase().includes(q)) ||
        r.subtitle?.toLowerCase().includes(q)
    )
  }

  const ready5m = useMemo(() => filterBySearch(recipesByTier['5m']), [recipesByTier, searchVal])
  const ready15m = useMemo(() => filterBySearch(recipesByTier['15m']), [recipesByTier, searchVal])
  const ready30m = useMemo(() => filterBySearch(recipesByTier['30m']), [recipesByTier, searchVal])
  const readyWeekend = useMemo(() => filterBySearch(recipesByTier['weekend']), [recipesByTier, searchVal])

  // Top AI Sous Chef Recommended Recipe for banner
  const recommendedRecipe = useMemo(() => {
    return ready15m[0] || ready5m[0] || matchedRecipes[0]
  }, [ready15m, ready5m, matchedRecipes])

  // Notification toggle
  const toggleNotification = () => {
    haptic(10)
    const next = !notifEnabled
    setNotifEnabled(next)
    setNotifToast(next ? 'Culinary alerts turned on' : 'Notifications muted')
    setTimeout(() => setNotifToast(null), 2200)
  }

  const avatarInitial = user?.email
    ? user.email[0].toUpperCase()
    : user?.user_metadata?.full_name
    ? user.user_metadata.full_name[0].toUpperCase()
    : 'G'

  return (
    <>
      <main
        className="flex flex-col px-5 pt-3 pb-36 gap-6 min-h-screen"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          overflowAnchor: 'none',
        }}
      >
        {/* ── Top Bar: Wordmark + Profile Avatar ── */}
        <header className="flex items-center justify-between">
          <Link href="/mobile" className="flex items-center gap-2 group">
            <span className="font-serif font-bold text-2xl tracking-tight text-[var(--text-primary)]">
              Mise
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
              Sous Chef
            </span>
          </Link>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--bg-card-border)] rounded-full px-3 py-1.5 transition-colors shadow-xs">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={toggleNotification}
              id="notif-btn"
              aria-label={notifEnabled ? 'Turn notifications off' : 'Turn notifications on'}
              className="relative flex items-center justify-center w-7 h-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {notifEnabled ? (
                <>
                  <Bell size={18} strokeWidth={2} className="text-[var(--accent)]" />
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[var(--success)] ring-2 ring-[var(--bg-card)]" />
                </>
              ) : (
                <BellOff size={18} strokeWidth={1.6} className="text-[var(--text-secondary)] opacity-60" />
              )}
            </motion.button>

            <div className="w-px h-4 bg-[var(--bg-card-border)]" />

            <Link
              href="/mobile/settings"
              id="profile-btn"
              aria-label="Open Kitchen Profile"
              onClick={() => haptic(8)}
              className="outline-none"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-7 h-7 rounded-full bg-[var(--bg-page)] overflow-hidden border border-[var(--bg-card-border)] hover:ring-2 hover:ring-[var(--accent)]/60 transition-all flex items-center justify-center shadow-2xs"
              >
                <span className="text-[11px] font-bold text-[var(--accent)]">
                  {avatarInitial}
                </span>
              </motion.div>
            </Link>
          </div>
        </header>

        {/* ── Active Cooking Session Banner (If in progress) ── */}
        <AnimatePresence mode="popLayout" initial={false}>
          {activeSession && (
            <motion.div
              key="continue-cooking-shell"
              layout
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              className="w-full"
            >
              <section className="relative overflow-hidden rounded-[26px] p-4 bg-[var(--bg-banner)] text-[var(--text-on-banner)] shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-xs">
                      <Image
                        src={activeSession.recipeImage || '/food/egg_roast.jpg'}
                        alt={activeSession.recipeName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <Flame className="w-5 h-5 text-white fill-white/80" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1">
                          <Flame size={12} />
                          Continue Cooking
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        <span className="text-[11px] font-medium text-[var(--text-on-banner)]/80">
                          {activeSession.totalRemainingMinutes}m left
                        </span>
                      </div>

                      <h4 className="text-sm font-apple font-bold text-[var(--text-on-banner)] truncate">
                        {activeSession.recipeName}
                      </h4>

                      <p className="text-[11px] text-[var(--text-on-banner)]/80 font-medium truncate">
                        Step {activeSession.currentStepIndex + 1} of {activeSession.totalSteps}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/steps/${activeSession.recipeId}?servings=2`}
                      onClick={(e) => {
                        if (activeSession.deviceUserId && activeSession.deviceUserId !== userId) {
                          e.preventDefault()
                          haptic(10)
                          openSignInSheet('continue_cooking')
                          return
                        }
                        haptic(12)
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--accent)] text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Resume</span>
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        haptic(8)
                        clearSession()
                      }}
                      aria-label="Dismiss active cooking"
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-on-banner)]/60 hover:text-[var(--text-on-banner)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 1. ZOMATO-STYLE LOCATION & REGION SELECTOR BAR ── */}
        <LocationRegionBar
          selectedRegion={selectedRegion}
          onSelectRegion={(r) => {
            haptic(10)
            updateRegion(r)
          }}
          cityLabel={
            selectedRegion === 'Kerala'
              ? 'God’s Own Kitchen'
              : selectedRegion === 'Tamil Nadu'
              ? 'Tamil Heritage'
              : selectedRegion === 'Maharashtra'
              ? 'Flavors of Maharashtra'
              : 'Local Indian Flavors'
          }
        />

        {/* ── 2. AI SOUS CHEF REGIONAL HERO BANNER ── */}
        <SousChefBanner
          region={selectedRegion}
          pantryCount={pantry.length}
          recommendedRecipe={recommendedRecipe}
        />

        {/* ── 3. VISUAL DISCOVERY CONTROLS: Pantry Search & Mood Vibe Bar ── */}
        <section className="space-y-3">
          {/* Glass Search & Filter Bar */}
          <div className="glass-input h-14 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-[var(--bg-card-border)] rounded-2xl flex items-center gap-2">
            <Search size={20} strokeWidth={1.8} className="text-stone-400 shrink-0" />
            <input
              id="regional-dish-search"
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search dishes or ingredients (e.g. eggs, thoran, poha)…"
              className="flex-1 bg-transparent outline-none text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
              aria-label="Search dishes or ingredients"
            />

            {searchVal && (
              <button
                onClick={() => setSearchVal('')}
                className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600"
              >
                <X size={14} />
              </button>
            )}

            {/* Microphone Voice Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                haptic(10)
                setVoiceOpen(true)
              }}
              aria-label="Voice search ingredients"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 transition-colors shrink-0"
            >
              <Mic size={16} strokeWidth={2} />
            </motion.button>

            {/* Camera Scan Shortcut */}
            <Link
              href="/mobile/scan"
              onClick={() => haptic(10)}
              aria-label="Camera scan ingredients"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
              <Camera size={16} strokeWidth={1.8} />
            </Link>

            {/* Diet Filter Trigger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                haptic(10)
                setFilterOpen(true)
              }}
              aria-label="Open filter preferences"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
              <SlidersHorizontal size={15} strokeWidth={1.8} />
            </motion.button>
          </div>

          {/* Quick Mood & Craving Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 py-0.5">
            {moodFilters.map((m) => {
              const isSelected = selectedMood === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    haptic(8)
                    setSelectedMood(isSelected ? null : m.id)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* Background AI Enrichment Indicator */}
          {isAIGenerating && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-semibold w-max animate-pulse">
              <ChefHat size={13} className="shrink-0" />
              <span>AI Sous Chef matching background recipes for {selectedRegion}…</span>
            </div>
          )}
        </section>

        {/* ── 4. SECTION 1: ⚡ READY IN 5 MINUTES ── */}
        <section className="space-y-3" key={`sec-5m-${selectedRegion}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500">
                <Zap size={16} className="fill-amber-500" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
                  Ready in 5 Minutes
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Fast assemblies, quick thorans & instant staples
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-[var(--accent-text-on-light)]">
              {ready5m.length} options
            </span>
          </div>

          {/* Horizontally Scrollable Tray */}
          <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 pb-2 snap-x snap-mandatory">
            {ready5m.map((recipe) => (
              <div key={recipe.id} className="snap-start shrink-0">
                <RegionalRecipeCard
                  recipe={recipe}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. SECTION 2: 🍳 READY IN 10-15 MINUTES ── */}
        <section className="space-y-3" key={`sec-15m-${selectedRegion}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-rose-500/15 text-rose-500">
                <Flame size={16} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
                  Ready in 10-15 Minutes
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Hot skillet roasts, tempered rice & skillet staples
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-[var(--accent-text-on-light)]">
              {ready15m.length} options
            </span>
          </div>

          {/* Horizontally Scrollable Tray */}
          <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 pb-2 snap-x snap-mandatory">
            {ready15m.map((recipe) => (
              <div key={recipe.id} className="snap-start shrink-0">
                <RegionalRecipeCard
                  recipe={recipe}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. SECTION 3: 🥘 READY IN 30 MINUTES ── */}
        <section className="space-y-3" key={`sec-30m-${selectedRegion}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-orange-500/15 text-orange-500">
                <CookingPot size={16} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
                  Ready in 30 Minutes
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Simmered stews, tangy kuzhambu & fiery misal broths
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-[var(--accent-text-on-light)]">
              {ready30m.length} options
            </span>
          </div>

          {/* Horizontally Scrollable Tray */}
          <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 pb-2 snap-x snap-mandatory">
            {ready30m.map((recipe) => (
              <div key={recipe.id} className="snap-start shrink-0">
                <RegionalRecipeCard
                  recipe={recipe}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. SECTION 4: 👨‍🍳 WEEKEND COOKING ── */}
        <section className="space-y-3" key={`sec-wknd-${selectedRegion}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-500">
                <Utensils size={16} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
                  Weekend Cooking
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Slow-braised biryanis, roasted chukkas & culinary masterclasses
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-[var(--accent-text-on-light)]">
              {readyWeekend.length} feasts
            </span>
          </div>

          {/* Horizontally Scrollable Tray */}
          <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 pb-2 snap-x snap-mandatory">
            {readyWeekend.map((recipe) => (
              <div key={recipe.id} className="snap-start shrink-0">
                <RegionalRecipeCard
                  recipe={recipe}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. PANTRY INGREDIENTS STATUS (Dynamic Quick Tags) ── */}
        <section className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-apple font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Active Pantry Staples ({pantry.length})
            </h3>
            <Link
              href="/mobile/scan"
              className="text-xs font-semibold text-[var(--accent-text-on-light)] hover:opacity-80"
            >
              Add more
            </Link>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 py-1">
            {pantry.slice(0, 8).map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--text-primary)] whitespace-nowrap"
              >
                {item}
              </span>
            ))}
            {pantry.length > 8 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] whitespace-nowrap">
                +{pantry.length - 8} more
              </span>
            )}
          </div>
        </section>
      </main>

      {/* Filter Preference Sheet */}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />

      {/* Voice Search Modal */}
      <VoiceSearchModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSelectIngredient={(phrase) => {
          setSearchVal(phrase)
        }}
      />

      {/* Notification Toast */}
      <AnimatePresence>
        {notifToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 480, damping: 28 }}
            className="fixed top-6 inset-x-0 mx-auto w-max z-50 flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-banner)] text-[var(--text-on-banner)] text-xs font-semibold rounded-full shadow-xl border border-[var(--bg-card-border)] pointer-events-none"
          >
            {notifEnabled ? (
              <Bell size={14} className="text-[var(--accent)]" />
            ) : (
              <BellOff size={14} className="text-[var(--text-on-banner)]/60" />
            )}
            <span>{notifToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
