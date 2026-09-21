'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  Clock,
  Sparkles,
  Flame,
  Trophy,
  Star,
  CheckCircle2,
  Play,
  X,
  ChevronRight,
  UtensilsCrossed,
  RotateCcw,
  Sparkle,
  Zap,
} from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'
import { useActiveCooking } from '@/lib/activeCooking'
import { useAuth } from '@/lib/useAuth'
import { useScannedPantry, useSavedRecipes } from '@/lib/useSavedRecipes'
import {
  getCookingStreakData,
  INGREDIENT_SUGGESTIONS,
  READY_TO_COOK_RECIPES,
  CookingMood,
  CookingTimeFilter,
  getAssistantHeadline,
} from '@/lib/homeData'
import { MoodSelector } from '@/components/cooking/MoodSelector'
import { TimePreferenceSelector } from '@/components/cooking/TimePreferenceSelector'
import { getDynamicGreeting } from '@/lib/greeting'


// ── Filter Sheet (Dietary & Kitchen Preferences) ─────────────────────
function FilterSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { settings, updateDiet } = useSettings()
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
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
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
                  Kitchen Preferences
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Tailor recipes to your dietary requirements
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
                Dietary Lifestyle
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
              <span>Save Preferences</span>
              <ChevronRight size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Voice Search Overlay Simulation ────────────────────────────────
function VoiceSearchModal({
  open,
  onClose,
  onSelectIngredient,
}: {
  open: boolean
  onClose: () => void
  onSelectIngredient: (phrase: string) => void
}) {
  const haptic = useHaptic()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="voice-search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-950/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[var(--bg-card)] rounded-[32px] p-6 text-center border border-[var(--bg-card-border)] shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500"
            >
              <X size={16} />
            </button>

            {/* Animated Microphone Waves */}
            <div className="relative w-24 h-24 mx-auto my-4 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-[var(--accent)]/20"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-2 rounded-full bg-[var(--accent)]/40"
              />
              <div className="relative z-10 w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-lg">
                <Mic size={28} className="animate-pulse" />
              </div>
            </div>

            <h3 className="text-lg font-apple font-bold text-stone-900 dark:text-white">
              Listening for ingredients…
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-6">
              Say what’s in your kitchen, e.g. “garlic, pasta, cherry tomatoes”
            </p>

            <div className="flex flex-col gap-2">
              {[
                '“I have garlic, pasta and olive oil”',
                '“Tomatoes, eggs and spinach”',
                '“Rice, scallions and soy sauce”',
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    haptic(12)
                    onSelectIngredient(sample.replace(/[“”]/g, ''))
                    onClose()
                  }}
                  className="py-2.5 px-4 rounded-2xl bg-[var(--bg-page)] text-[var(--text-primary)] text-xs font-medium hover:opacity-90 border border-[var(--bg-card-border)] transition-all text-left"
                >
                  {sample}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Home Screen Component ─────────────────────────────────────
export default function MobileLandingPage() {
  const haptic = useHaptic()
  const { settings } = useSettings()
  const { session: activeSession, clearSession } = useActiveCooking()
  const { user, userId, openSignInSheet } = useAuth()
  const { pantry } = useScannedPantry()
  const { saved } = useSavedRecipes()

  // Primary Decision States: Time & Mood
  const [selectedTime, setSelectedTime] = useState<CookingTimeFilter>('10m')
  const [customMinutes, setCustomMinutes] = useState<number>(20)
  const [selectedMood, setSelectedMood] = useState<CookingMood | null>(null)

  // Secondary Search / Ingredient States
  const [filterOpen, setFilterOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifToast, setNotifToast] = useState<string | null>(null)
  const [apiRecipes, setApiRecipes] = useState<any[] | null>(null)

  const greeting = getDynamicGreeting()

  // Maximum minutes corresponding to current selection
  const effectiveMaxMinutes = useMemo(() => {
    switch (selectedTime) {
      case '5m':
        return 5
      case '10m':
        return 10
      case '30m':
        return 30
      case '1h':
        return 120
      case 'custom':
        return customMinutes
      default:
        return 30
    }
  }, [selectedTime, customMinutes])

  // Notification toggle
  const toggleNotification = () => {
    haptic(10)
    const next = !notifEnabled
    setNotifEnabled(next)
    setNotifToast(next ? 'Culinary alerts turned on' : 'Notifications muted')
    setTimeout(() => setNotifToast(null), 2200)
  }

  // Dynamically query match-recipes API when time, search, or filters change
  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function queryRecipes() {
      const activeIngredients = selectedIngredient
        ? [selectedIngredient]
        : searchVal.trim()
        ? [searchVal.trim()]
        : pantry.length > 0
        ? pantry
        : undefined

      const queryTime = selectedTime === '1h' ? 75 : effectiveMaxMinutes

      try {
        const res = await fetch('/api/match-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: activeIngredients,
            diet: settings.diet === 'all' ? null : settings.diet,
            servings: settings.servings || 2,
            time: queryTime,
            mood: selectedMood,
          }),
          signal: controller.signal,
        })

        if (res.ok) {
          const data = await res.json()
          if (active && Array.isArray(data.recipes) && data.recipes.length > 0) {
            setApiRecipes(
              data.recipes.map((r: any) => ({
                id: r.id,
                name: r.name,
                subtitle: r.missingIngredients?.length
                  ? `Needs ${r.missingIngredients.slice(0, 2).join(', ')}`
                  : 'All ingredients ready',
                image: r.image || '/food/pasta.jpg',
                time: r.timeMinutes || 15,
                ingredientCount: r.allIngredients?.length || 5,
                timesCooked: 1,
                confidenceMatch: Math.round((r.matchScore || 1) * 100),
                matchLabel: `${Math.round((r.matchScore || 1) * 100)}% Match`,
                diet: r.diet || 'veg',
                difficulty: r.timeMinutes <= 10 ? 'Quick' : 'Easy',
                rating: 4.8,
              }))
            )
          } else if (active) {
            setApiRecipes([])
          }
        } else if (active) {
          setApiRecipes([])
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && active) {
          setApiRecipes([])
        }
      }
    }

    const timer = setTimeout(queryRecipes, 300)
    return () => {
      active = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [
    searchVal,
    selectedIngredient,
    settings.diet,
    settings.servings,
    pantry,
    selectedTime,
    effectiveMaxMinutes,
    selectedMood,
  ])

  // Filter Ready to Cook recipes based on primary decision (Time), Mood, and Ingredients
  const readyToCookList = useMemo(() => {
    // Merge API results with robust built-in catalogue so all time slots stay vibrant
    const sourceList =
      apiRecipes && apiRecipes.length > 0 ? apiRecipes : READY_TO_COOK_RECIPES

    return sourceList.filter((r) => {
      // 1. Primary Decision: Time Available
      if (selectedTime === '5m' && r.time > 5) return false
      if (selectedTime === '10m' && r.time > 10) return false
      if (selectedTime === '30m' && r.time > 30) return false
      if (selectedTime === '1h' && r.time < 40) return false
      if (selectedTime === 'custom' && r.time > customMinutes) return false

      // 2. Secondary Decision: Mood / Energy level
      if (selectedMood === 'exhausted') {
        // Zero effort: maximum 15 min, at most 5 ingredients, favor quick/easy
        if (r.time > 15 || r.ingredientCount > 5) return false
      }
      if (selectedMood === 'healthy') {
        // Healthy: lean proteins, bowls, greens, salads
        const isHealthy =
          r.diet === 'vegan' ||
          r.name.toLowerCase().includes('salad') ||
          r.name.toLowerCase().includes('bowl') ||
          r.name.toLowerCase().includes('salmon') ||
          r.name.toLowerCase().includes('parfait') ||
          (r.moods && r.moods.includes('healthy'))
        if (!isHealthy) return false
      }
      if (selectedMood === 'spicy') {
        const isSpicy =
          r.name.toLowerCase().includes('spicy') ||
          r.name.toLowerCase().includes('chili') ||
          r.name.toLowerCase().includes('aglio') ||
          r.name.toLowerCase().includes('curry') ||
          (r.moods && r.moods.includes('spicy'))
        if (!isSpicy) return false
      }
      if (selectedMood === 'budget') {
        const isBudget =
          r.ingredientCount <= 5 ||
          (r.moods && r.moods.includes('budget'))
        if (!isBudget) return false
      }

      // 3. Search / Quick Ingredient Pill Filter
      if (selectedIngredient) {
        const query = selectedIngredient.toLowerCase()
        const matchTitle = r.name.toLowerCase().includes(query)
        const matchSub = r.subtitle?.toLowerCase().includes(query) || false
        if (!matchTitle && !matchSub) return false
      }
      if (searchVal.trim()) {
        const query = searchVal.toLowerCase().trim()
        const matchTitle = r.name.toLowerCase().includes(query)
        const matchSub = r.subtitle?.toLowerCase().includes(query) || false
        if (!matchTitle && !matchSub) return false
      }

      // 4. Dietary Filtering
      if (settings.diet === 'veg' && r.diet === 'non-veg') return false
      if (settings.diet === 'vegan' && r.diet !== 'vegan') return false
      if (settings.diet === 'jain' && r.diet !== 'vegan' && r.diet !== 'jain') return false

      return true
    })
  }, [
    apiRecipes,
    selectedTime,
    customMinutes,
    selectedMood,
    selectedIngredient,
    searchVal,
    settings.diet,
  ])

  // Chef's Pick dynamically adapted to the chosen Time & Mood
  const chefsPick = useMemo(() => {
    // Choose top matching item or best fallback fitting the active constraint
    let top = readyToCookList[0]

    if (!top) {
      top = READY_TO_COOK_RECIPES.find((r) => {
        if (selectedTime === '5m') return r.time <= 5
        if (selectedTime === '10m') return r.time <= 10
        if (selectedTime === '30m') return r.time <= 30
        if (selectedTime === '1h') return r.time >= 40
        if (selectedTime === 'custom') return r.time <= customMinutes
        return true
      }) || READY_TO_COOK_RECIPES[0]
    }

    if (!top) return null

    let timeTag = ''
    if (selectedTime === '5m') timeTag = '5-Minute Express'
    else if (selectedTime === '10m') timeTag = '10-Minute Quick'
    else if (selectedTime === '30m') timeTag = '30-Minute Weeknight'
    else if (selectedTime === '1h') timeTag = 'Slow-Simmered'
    else if (selectedTime === 'custom') timeTag = `${customMinutes}-Minute`
    else timeTag = greeting.mealContext.charAt(0).toUpperCase() + greeting.mealContext.slice(1)

    let moodPrefix = ''
    if (selectedMood === 'exhausted') moodPrefix = 'Zero-Effort '
    else if (selectedMood === 'treat') moodPrefix = 'Indulgent '
    else if (selectedMood === 'healthy') moodPrefix = 'Vibrant '
    else if (selectedMood === 'spicy') moodPrefix = 'Fiery '
    else if (selectedMood === 'budget') moodPrefix = 'Pantry '

    return {
      id: top.id,
      name: top.name,
      tagline: `Chef’s ${moodPrefix}${timeTag} Pick`,
      description:
        top.subtitle && top.subtitle !== 'All ingredients ready'
          ? `Featuring fresh ingredients tailored for your kitchen right now: ${top.subtitle}.`
          : 'Carefully curated to match your exact available time and current energy level.',
      image: top.image || '/food/pasta.jpg',
      time: top.time,
      ingredientCount: top.ingredientCount,
      match: top.confidenceMatch,
      reason: `${top.confidenceMatch}% Match • Ready in ${top.time}m`,
    }
  }, [readyToCookList, selectedTime, selectedMood, customMinutes, greeting.mealContext])

  // Real recently cooked dishes derived from user saves
  const recentlyCookedList = useMemo(() => {
    return saved.filter((r) => (r.timesCooked && r.timesCooked > 0) || r.lastCooked)
  }, [saved])

  // Toggle quick-tap ingredient filter
  const handleTogglePill = (name: string) => {
    haptic(8)
    if (selectedIngredient === name) {
      setSelectedIngredient(null)
    } else {
      setSelectedIngredient(name)
    }
  }

  const avatarInitial = user?.email
    ? user.email[0].toUpperCase()
    : user?.user_metadata?.full_name
    ? user.user_metadata.full_name[0].toUpperCase()
    : 'G'

  return (
    <>
      <main
        className="flex flex-col px-5 pt-4 pb-36 gap-6 min-h-screen"
        style={{
          paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
          overflowAnchor: 'none',
        }}
      >
        {/* ── Top Bar: Wordmark + Profile Avatar ── */}
        <header className="flex items-center justify-between">
          <Link href="/mobile" className="flex items-center gap-2 group">
            <span className="font-serif font-bold text-2xl tracking-tight text-[var(--text-primary)]">
              Mise
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
                <div className="w-full h-full bg-[var(--bg-page)] flex items-center justify-center">
                  <span className="text-[11px] font-bold text-[var(--accent)]">
                    {avatarInitial}
                  </span>
                </div>
              </motion.div>
            </Link>
          </div>
        </header>

        {/* ── Active Cooking Session Banner (If recipe in progress) ── */}
        <AnimatePresence mode="popLayout" initial={false}>
          {activeSession && (
            <motion.div
              key="continue-cooking-shell"
              layout
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: -10,
                transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
              }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="w-full"
            >
              <section className="relative overflow-hidden rounded-[26px] p-4 bg-[var(--bg-banner)] text-[var(--text-on-banner)] shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-xs">
                      <Image
                        src={activeSession.recipeImage || '/food/pasta.jpg'}
                        alt={activeSession.recipeName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/15" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white fill-white/80 drop-shadow-xs" />
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
                          {activeSession.totalRemainingMinutes} min left
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

        {/* ── Conversational Assistant Hero ── */}
        <section>
          <h1 className="text-2xl sm:text-3xl font-apple font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            {getAssistantHeadline(selectedTime, customMinutes)}
          </h1>
        </section>

        {/* ── 1. MOOD SELECTOR (Optional Energy & Vibe) ── */}
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={setSelectedMood}
        />

        {/* ── 2. TIME PREFERENCE SELECTOR ("How much time do I have?") ── */}
        <TimePreferenceSelector
          selectedTime={selectedTime}
          customMinutes={customMinutes}
          onSelectTime={setSelectedTime}
          onChangeCustomMinutes={setCustomMinutes}
        />

        {/* ── 3. AVAILABLE INGREDIENTS (Search, Voice, Scan, Quick Pills) ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              What Ingredients Do You Have?
            </h2>
            <span className="text-xs font-semibold text-[var(--accent-text-on-light)]">
              {pantry.length} in pantry
            </span>
          </div>

          {/* Primary Glass Search Bar */}
          <div className="glass-input h-14 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-[var(--bg-card-border)]">
            <Search size={20} strokeWidth={1.8} className="text-stone-400 shrink-0" />
            <input
              id="smart-ingredient-search"
              type="text"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value)
                if (selectedIngredient) setSelectedIngredient(null)
              }}
              placeholder="Enter ingredients (e.g. garlic, pasta, eggs)…"
              className="flex-1 bg-transparent outline-none text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
              aria-label="What ingredients do you have?"
            />

            {/* Clear button if text entered */}
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
              title="Voice search"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 transition-colors shrink-0"
            >
              <Mic size={16} strokeWidth={2} />
            </motion.button>

            {/* Camera Scan Shortcut */}
            <Link
              href="/mobile/scan"
              onClick={() => haptic(10)}
              aria-label="Camera scan ingredients"
              title="Scan with camera"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
              <Camera size={16} strokeWidth={1.8} />
            </Link>

            {/* Dietary Filter Trigger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                haptic(10)
                setFilterOpen(true)
              }}
              aria-label="Open filter settings"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
              <SlidersHorizontal size={15} strokeWidth={1.8} />
            </motion.button>
          </div>

          {/* Quick-Tap Ingredient Suggestion Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-5 px-5 scroll-px-5">
            {INGREDIENT_SUGGESTIONS.map((ing) => {
              const isSelected = selectedIngredient === ing.name
              return (
                <button
                  key={ing.name}
                  onClick={() => handleTogglePill(ing.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white shadow-xs scale-105'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{ing.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── 4. READY TO COOK RECIPES (Primary Filtered Feed) ── */}
        <section className="w-full min-w-0 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
                  Ready To Cook
                </h2>
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {readyToCookList.length} {readyToCookList.length === 1 ? 'recipe' : 'recipes'} fitting your time & ingredients
              </p>
            </div>
            <Link
              href="/mobile/saved"
              onClick={() => haptic(8)}
              className="text-xs font-semibold text-[var(--accent-text-on-light)] hover:opacity-80"
            >
              See all
            </Link>
          </div>

          {/* Horizontal Snap Scroll of Filtered Recipe Cards */}
          {readyToCookList.length === 0 ? (
            <div className="py-8 px-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto">
                <Clock size={22} />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)] font-apple">
                  No recipes found within this time window
                </p>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mt-1">
                  Try extending your time limit to 30 min or clearing your ingredient filter to see more delicious options.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptic(10)
                  setSelectedTime('30m')
                  setSelectedMood(null)
                  setSelectedIngredient(null)
                }}
                className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95"
              >
                Switch to 30 Min Options
              </button>
            </div>
          ) : (
            <div className="snap-row -mx-5 px-5 scroll-px-5 pb-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {readyToCookList.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-64 shrink-0"
                  >
                    <GlassCard
                      padding={false}
                      className="overflow-hidden border border-[var(--bg-card-border)] flex flex-col group bg-[var(--bg-card)] rounded-3xl"
                    >
                      {/* Recipe Image with Confidence & Time Badges */}
                      <Link href={`/mobile/detail/${recipe.id}`} onClick={() => haptic(8)}>
                        <div className="relative w-full h-44 bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer">
                          <Image
                            src={recipe.image}
                            alt={recipe.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            sizes="256px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

                          {/* Top Match Confidence Badge */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--success-bg)] text-[var(--success)] text-[11px] font-bold shadow-sm">
                            <CheckCircle2 size={12} strokeWidth={2.5} />
                            <span>{recipe.confidenceMatch}% Match</span>
                          </div>

                          {/* Time Highlight Badge */}
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold shadow-xs flex items-center gap-1">
                            <Zap size={11} className="text-amber-400 fill-amber-400" />
                            <span>{recipe.time}m</span>
                          </div>

                          {/* Bottom Info on Image */}
                          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white text-xs font-semibold">
                            <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                              <UtensilsCrossed size={11} /> {recipe.ingredientCount} ingredients
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              <span>{recipe.rating || 4.8}</span>
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Card Content & Primary "Start Cooking" CTA */}
                      <div className="p-3.5 flex flex-col justify-between flex-1 gap-3 bg-[var(--bg-card)]">
                        <div>
                          <Link href={`/mobile/detail/${recipe.id}`} onClick={() => haptic(8)}>
                            <h3 className="font-apple font-bold text-[var(--text-primary)] text-sm leading-snug tracking-tight hover:text-[var(--accent)] transition-colors line-clamp-1">
                              {recipe.name}
                            </h3>
                          </Link>

                          {recipe.subtitle && (
                            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                              {recipe.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[var(--bg-card-border)]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                            {recipe.diet} • {recipe.difficulty}
                          </span>

                          <Link
                            href={`/steps/${recipe.id}?servings=2`}
                            onClick={() => haptic(12)}
                            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xs"
                          >
                            <Play size={10} fill="currentColor" />
                            <span>Cook</span>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── 5. CHEF'S PICKS (Contextualized to Time & Mood) ── */}
        {chefsPick && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-[var(--accent)]" />
                <h2 className="text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
                  Chef&apos;s Pick
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[var(--accent-text-on-light)] uppercase tracking-wider">
                Tailored To Your Window
              </span>
            </div>

            <GlassCard
              padding={false}
              className="overflow-hidden border border-[var(--bg-card-border)] relative group bg-[var(--bg-card)] rounded-3xl"
            >
              <div className="relative h-80 sm:h-[340px] w-full">
                <Image
                  src={chefsPick.image}
                  alt={chefsPick.name}
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  sizes="420px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                {/* Tag Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                  <span className="px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                    <Sparkles size={12} className="text-white" />
                    <span>{chefsPick.reason}</span>
                  </span>
                </div>

                {/* Bottom Info & One-Tap Start */}
                <div className="absolute bottom-0 inset-x-0 p-5 space-y-3 z-10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider block">
                      {chefsPick.tagline}
                    </span>
                    <h3 className="text-lg sm:text-xl font-apple font-bold text-white tracking-tight leading-snug">
                      {chefsPick.name}
                    </h3>
                    <p className="text-xs text-stone-200/90 line-clamp-2 leading-relaxed">
                      {chefsPick.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 gap-3">
                    <div className="flex items-center gap-3 text-xs font-medium text-stone-300 shrink-0">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {chefsPick.time} min
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed size={13} /> {chefsPick.ingredientCount} ingredients
                      </span>
                    </div>

                    <Link
                      href={`/steps/${chefsPick.id}?servings=2`}
                      onClick={() => haptic(14)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--accent)] text-white font-bold text-xs shadow-lg active:scale-95 transition-all hover:opacity-95 shrink-0"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Cook This Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        )}

        {/* ── 6. RECENTLY COOKED (With Time-Fit Indicators) ── */}
        <section className="w-full min-w-0 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
                Recently Cooked
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Your past kitchen sessions & repeatable favorites
              </p>
            </div>
            <Link
              href="/mobile/saved"
              onClick={() => haptic(8)}
              className="text-xs font-semibold text-[var(--accent-text-on-light)] hover:opacity-80"
            >
              History
            </Link>
          </div>

          {recentlyCookedList.length === 0 ? (
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-center space-y-2">
              <p className="font-bold text-sm text-[var(--text-primary)] font-apple">
                No dishes cooked yet
              </p>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
                Cook your first recipe above to record your cooking records and build your kitchen streak!
              </p>
            </div>
          ) : (
            <div className="snap-row -mx-5 px-5 scroll-px-5 pb-2">
              {recentlyCookedList.map((card) => {
                const fitsActiveTime = card.time <= effectiveMaxMinutes

                return (
                  <motion.div
                    key={card.id}
                    whileTap={{ scale: 0.98 }}
                    className="w-48 shrink-0"
                  >
                    <Link href={`/mobile/detail/${card.id}`} onClick={() => haptic(8)}>
                      <GlassCard
                        padding={false}
                        className="overflow-hidden border border-[var(--bg-card-border)] cursor-pointer group bg-[var(--bg-card)] rounded-2xl"
                      >
                        <div className="relative w-full h-36 bg-stone-100 dark:bg-stone-800">
                          <Image
                            src={card.image || '/food/pasta.jpg'}
                            alt={card.name}
                            fill
                            className="object-cover group-hover:scale-104 transition-transform duration-500"
                            sizes="192px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Fits Active Time Badge */}
                          {fitsActiveTime && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[var(--accent)] text-white text-[9px] font-bold shadow-xs">
                              Fits time
                            </div>
                          )}

                          {/* Last Cooked Date Badge */}
                          {card.lastCooked && (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold">
                              {card.lastCooked}
                            </div>
                          )}
                        </div>

                        <div className="p-3 space-y-1.5 bg-[var(--bg-card)]">
                          <p className="text-xs font-apple font-bold text-[var(--text-primary)] line-clamp-1 tracking-tight">
                            {card.name}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                              <RotateCcw size={10} /> {card.timesCooked || 1}x
                            </span>
                            <span className="font-bold text-[var(--accent-text-on-light)]">
                              {card.time}m
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── 7. COOKING STREAK & PERSONAL MILESTONES ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-apple font-bold text-[var(--text-primary)] tracking-tight">
              Culinary Milestones
            </h2>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Personal Stats
            </span>
          </div>

          <GlassCard
            padding={false}
            className="p-5 border border-[var(--bg-card-border)] bg-[var(--bg-card)] rounded-3xl"
          >
            {(() => {
              const streak = getCookingStreakData(saved.length, recentlyCookedList.length)
              return (
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-[var(--bg-card-border)]">
                  {/* Cooking Streak */}
                  <div className="px-1 space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xl font-bold font-apple text-[var(--text-primary)]">
                      <Flame size={18} className="text-[var(--accent)]" />
                      <span className="tabular-nums">{streak.streakDays}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Day Streak
                    </p>
                  </div>

                  {/* Recipes Completed */}
                  <div className="px-1 space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xl font-bold font-apple text-[var(--text-primary)]">
                      <Trophy size={18} className="text-amber-500" />
                      <span className="tabular-nums" suppressHydrationWarning>
                        {streak.recipesCompleted}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Completed
                    </p>
                  </div>

                  {/* Favorites Saved */}
                  <div className="px-1 space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xl font-bold font-apple text-[var(--text-primary)]">
                      <Star size={18} className="text-[var(--accent)]" />
                      <span className="tabular-nums" suppressHydrationWarning>
                        {saved.length}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Cookbook
                    </p>
                  </div>
                </div>
              )
            })()}
          </GlassCard>
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
          setSelectedIngredient(null)
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
