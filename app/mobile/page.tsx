'use client'

import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  Bell, BellOff, SlidersHorizontal, Search,
  Clock, Users, Star,
  Leaf, Flame, Droplets,
} from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { StatRow } from '@/components/StatChip'
import { useHaptic } from '@/lib/useHaptic'
import { getGreeting } from '@/lib/greeting'
import { useSettings } from '@/lib/useSettings'

// ── Types ──────────────────────────────────────────────────────────
interface TicketCard {
  id: string
  name: string
  image: string
  time: number
  servings: number
  match: number
  diet: 'veg' | 'non-veg' | 'vegan' | 'jain'
  allergens: string[]
  carbs: string
  fats: string
  sugar: string
}

// ── Static seed data (reflects user diet & allergy settings) ───────
const RECENT_TICKETS: TicketCard[] = [
  {
    id: 'pasta-001',
    name: 'Spicy Tomato Fusilli',
    image: '/food/pasta.jpg',
    time: 20,
    servings: 2,
    match: 94,
    diet: 'veg',
    allergens: ['gluten'],
    carbs: '18.2%',
    fats: '0.5%',
    sugar: '12.4%',
  },
  {
    id: 'salad-001',
    name: 'Mediterranean Salad',
    image: '/food/salad.jpg',
    time: 10,
    servings: 2,
    match: 88,
    diet: 'vegan',
    allergens: [],
    carbs: '11.4%',
    fats: '22.1%',
    sugar: '6.8%',
  },
  {
    id: 'yogurt-001',
    name: 'Berry Yogurt Bowl',
    image: '/food/yogurt.jpg',
    time: 5,
    servings: 1,
    match: 97,
    diet: 'veg',
    allergens: ['dairy'],
    carbs: '24.3%',
    fats: '4.2%',
    sugar: '31.0%',
  },
  {
    id: 'bowl-001',
    name: 'Salmon Rice Bowl',
    image: '/food/bowl.jpg',
    time: 25,
    servings: 2,
    match: 91,
    diet: 'non-veg',
    allergens: ['seafood'],
    carbs: '32.1%',
    fats: '18.7%',
    sugar: '3.2%',
  },
]

// ── Stagger variants ───────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeRise = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

// ── Ticket card component ──────────────────────────────────────────
function TicketCardItem({ card }: { card: TicketCard }) {
  const haptic = useHaptic()

  const chips = [
    {
      icon: <Leaf size={14} strokeWidth={1.5} />,
      value: card.carbs,
      label: 'Carbs',
      iconColor: 'text-olive-600',
    },
    {
      icon: <Droplets size={14} strokeWidth={1.5} />,
      value: card.fats,
      label: 'Fats',
      iconColor: 'text-saffron-400',
    },
    {
      icon: <Flame size={14} strokeWidth={1.5} />,
      value: card.sugar,
      label: 'Sugar',
      iconColor: 'text-red-400',
    },
  ]

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => haptic(10)}
    >
      <Link href={`/mobile/detail/${card.id}`}>
        <GlassCard
          padding={false}
          className="w-44 overflow-hidden cursor-pointer hover:shadow-glass-heavy transition-shadow"
        >
          {/* Photo */}
          <div className="relative w-full h-40 bg-stone-100 dark:bg-stone-800">
            <Image
              src={card.image}
              alt={card.name}
              fill
              className="object-cover"
              sizes="176px"
            />
            {/* Match badge — saffron in light mode, peach #ffa371 in dark mode */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-saffron-500/90 dark:bg-[#ffa371] backdrop-blur-sm rounded-pill px-2 py-0.5 shadow-xs">
              <Star size={10} strokeWidth={2} className="text-white dark:text-[#2c2c2c]" fill="currentColor" />
              <span className="text-[11px] font-semibold text-white dark:text-[#2c2c2c] tabular-nums">{card.match}%</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Title */}
            <p className="text-[15px] font-manrope font-bold text-stone-900 dark:text-white leading-snug line-clamp-2 tracking-tight">
              {card.name}
            </p>

            {/* Quick stats row */}
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-manrope font-medium">
              <span className="flex items-center gap-1 text-[11px] font-manrope">
                <Clock size={11} strokeWidth={1.5} /> {card.time}m
              </span>
              <span className="w-px h-3 bg-stone-200 dark:bg-stone-700" />
              <span className="flex items-center gap-1 text-[11px] font-manrope">
                <Users size={11} strokeWidth={1.5} /> {card.servings}
              </span>
            </div>

            {/* Stat chips */}
            <StatRow chips={chips} className="gap-1.5" />
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}

// ── Filter Sheet (simple inline modal) ────────────────────────────
function FilterSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative w-full max-w-mobile mx-auto bg-[#ece7e4] dark:bg-[#242424] rounded-t-[32px] p-6 pb-12 shadow-2xl z-10 border-t border-white/60 dark:border-white/10 transition-colors"
      >
        <div className="w-10 h-1 bg-stone-300 dark:bg-stone-600 rounded-full mx-auto mb-6" />
        <h2 className="text-title text-stone-900 dark:text-white font-bold mb-6">Filter Recipes</h2>

        {/* Time filter */}
        <section className="mb-6">
          <p className="text-label text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wide">Max time</p>
          <div className="flex flex-wrap gap-2">
            {['5 min', '10 min', '20 min', '30 min', '45 min', 'Any'].map((t) => (
              <button
                key={t}
                className="px-4 py-2 rounded-pill text-label bg-white dark:bg-[#2c2c2c] text-stone-700 dark:text-stone-200
                           hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors border border-black/[0.06] dark:border-white/10 shadow-2xs"
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Category filter */}
        <section className="mb-6">
          <p className="text-label text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wide">Category</p>
          <div className="flex flex-wrap gap-2">
            {['All', 'Drink', 'Salad', 'Yogurt', 'Snack', 'Meal'].map((c) => (
              <button
                key={c}
                className="px-4 py-2 rounded-pill text-label bg-white dark:bg-[#2c2c2c] text-stone-700 dark:text-stone-200
                           hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors border border-black/[0.06] dark:border-white/10 shadow-2xs"
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Diet filter */}
        <section className="mb-8">
          <p className="text-label text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wide">Diet</p>
          <div className="flex flex-wrap gap-2">
            {['Any', 'Veg', 'Vegan', 'Non-veg', 'Jain'].map((d) => (
              <button
                key={d}
                className="px-4 py-2 rounded-pill text-label bg-white dark:bg-[#2c2c2c] text-stone-700 dark:text-stone-200
                           hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors border border-black/[0.06] dark:border-white/10 shadow-2xs"
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={onClose}
          className="w-full h-13 rounded-pill bg-stone-900 dark:bg-[#ffa371] text-white dark:text-[#2c2c2c] font-bold
                     text-label-lg hover:bg-stone-800 dark:hover:bg-[#ffb38a] transition-colors shadow-sm"
        >
          Apply Filters
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Main screen ────────────────────────────────────────────────────
export default function MobileLandingPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifToast, setNotifToast] = useState<string | null>(null)
  const haptic = useHaptic()
  const greeting = getGreeting()
  const { settings } = useSettings()

  const toggleNotification = () => {
    haptic(10)
    const next = !notifEnabled
    setNotifEnabled(next)
    setNotifToast(next ? 'Notifications turned on' : 'Notifications turned off')
    setTimeout(() => setNotifToast(null), 2000)
  }

  // Filter tickets based on global settings (diet + allergies) everywhere in app
  const filteredTickets = RECENT_TICKETS
    .filter((card) => {
      // Diet filtering
      if (settings.diet === 'veg' && card.diet === 'non-veg') return false
      if (settings.diet === 'vegan' && card.diet !== 'vegan') return false
      if (settings.diet === 'jain' && card.diet !== 'vegan' && card.diet !== 'jain') return false

      // Allergy filtering
      if (settings.allergies && settings.allergies.length > 0) {
        for (const a of settings.allergies) {
          if (card.allergens.includes(a)) return false
        }
      }
      return true
    })
    .map((card) => ({
      ...card,
      servings: settings.servings, // Automatically scaled to household size
    }))

  const displayTickets = filteredTickets.length > 0 ? filteredTickets : RECENT_TICKETS
  const todaysPick = displayTickets[0] || RECENT_TICKETS[0]

  return (
    <>
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col px-5 pt-4 pb-40 gap-8 min-h-screen"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        {/* ── Top bar ── */}
        <motion.div variants={fadeRise} className="flex items-center justify-between">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-2xl tracking-tight text-stone-900 dark:text-white">
              Mise
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffa371]" />
          </div>

          {/* Bell + H Avatar pill (Home Chef text removed) */}
          <div className="flex items-center gap-2.5 bg-white/90 dark:bg-[#2c2c2c]/90 backdrop-blur-glass border border-white dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] rounded-pill px-3 py-1.5 transition-colors">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={toggleNotification}
              id="notif-btn"
              aria-label={notifEnabled ? 'Turn notifications off' : 'Turn notifications on'}
              className="relative flex items-center justify-center w-7 h-7 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              {notifEnabled ? (
                <>
                  <Bell size={19} strokeWidth={2} className="text-saffron-500 dark:text-[#ffa371]" />
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#2c2c2c]" />
                </>
              ) : (
                <BellOff size={19} strokeWidth={1.5} className="text-stone-400 dark:text-stone-500" />
              )}
            </motion.button>

            <div className="w-px h-5 bg-stone-200 dark:bg-stone-700" />

            {/* Profile Link: Avatar 'H' goes to /mobile/settings */}
            <Link
              href="/mobile/settings"
              id="profile-btn"
              aria-label="Open Profile"
              onClick={() => haptic(8)}
              className="outline-none"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden border-2 border-white dark:border-stone-600 hover:ring-2 hover:ring-[#ffa371]/60 transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900 dark:from-[#ffa371] dark:to-amber-500 flex items-center justify-center">
                  <span className="text-[12px] font-bold text-white dark:text-[#2c2c2c]">
                    {(settings.account.name || 'H')[0].toUpperCase()}
                  </span>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* ── Hero greeting ── */}
        <motion.div variants={fadeRise} className="space-y-0.5">
          <h1 className="text-hero-sm font-bold font-apple text-stone-900 dark:text-white leading-tight tracking-tight transition-colors">
            {greeting.headline}
          </h1>
          <p className="text-[26px] font-bold font-apple text-stone-500 dark:text-stone-400 leading-tight tracking-tight transition-colors">
            {greeting.sub}
          </p>
        </motion.div>

        {/* ── Search bar & Active Settings Pills ── */}
        <motion.div variants={fadeRise} className="space-y-2.5">
          <div className="glass-input">
            <Search size={18} strokeWidth={1.5} className="text-stone-400 shrink-0" />
            <input
              id="ingredient-search"
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="What do you have?"
              className="flex-1 bg-transparent outline-none text-label-lg text-stone-800 dark:text-stone-100
                         placeholder:text-stone-400 dark:placeholder:text-stone-500"
              aria-label="Search ingredients"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setFilterOpen(true); haptic(10) }}
              id="filter-btn"
              aria-label="Open filters"
              className="flex items-center justify-center w-8 h-8 rounded-full
                         bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700
                         text-stone-700 dark:text-stone-200 shrink-0 transition-colors"
            >
              <SlidersHorizontal size={16} strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* Active Settings Filter Badge */}
          {(settings.diet !== 'all' || settings.allergies.length > 0 || settings.servings !== 2) && (
            <Link href="/mobile/settings" className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 dark:bg-[#2c2c2c] backdrop-blur-md rounded-full text-[11px] text-stone-800 dark:text-stone-200 border border-white dark:border-white/10 shadow-xs hover:bg-white dark:hover:bg-stone-800 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">
                {settings.diet !== 'all' ? settings.diet.toUpperCase() : 'ALL'}
                {settings.allergies.length > 0 && ` · No ${settings.allergies.join(', ')}`}
                {` · ${settings.servings} Servings`}
              </span>
              <span className="text-stone-400">Settings ›</span>
            </Link>
          )}
        </motion.div>

        {/* ── Recent tickets ── */}
        <motion.section variants={fadeRise} className="w-full min-w-0">
          <div className="section-header">
            <h2 className="section-title text-stone-900 dark:text-white">Recent tickets</h2>
            <Link href="/mobile/saved" className="see-all">See all</Link>
          </div>

          {/* Horizontal snap-scroll row */}
          <div className="snap-row -mx-5 px-5 scroll-px-5">
            {displayTickets.map((card) => (
              <TicketCardItem key={card.id} card={card} />
            ))}
          </div>
        </motion.section>

        {/* ── Featured / hero card ── */}
        <motion.section variants={fadeRise}>
          <h2 className="section-title text-stone-900 dark:text-white mb-4">Today&apos;s pick</h2>
          <motion.div whileTap={{ scale: 0.98 }} onClick={() => haptic(10)}>
            <Link href={`/mobile/detail/${todaysPick.id}`}>
              <GlassCard padding={false} className="overflow-hidden">
                <div className="relative h-52 w-full">
                  <Image
                    src={todaysPick.image}
                    alt={todaysPick.name}
                    fill
                    className="object-cover"
                    sizes="390px"
                    priority
                  />
                  {/* Gradient overlay — adapts to light / dark #2c2c2c */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 dark:from-[#2c2c2c] via-white/40 dark:via-[#2c2c2c]/50 to-transparent" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <p className="text-title font-apple text-stone-900 dark:text-white font-bold tracking-tight">{todaysPick.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-label text-stone-600 dark:text-stone-400">
                        <Clock size={13} strokeWidth={1.5} /> {todaysPick.time} min
                      </span>
                      <span className="flex items-center gap-1 text-label text-stone-600 dark:text-stone-400">
                        <Users size={13} strokeWidth={1.5} /> {todaysPick.servings} servings
                      </span>
                      <span className="flex items-center gap-1 text-label text-saffron-500 dark:text-[#ffa371] font-semibold">
                        <Star size={13} strokeWidth={2} fill="currentColor" /> {todaysPick.match}% match
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        </motion.section>
      </motion.main>

      {/* Filter sheet */}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />

      {/* Notification Toast */}
      <AnimatePresence>
        {notifToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 480, damping: 28 }}
            className="fixed top-6 inset-x-0 mx-auto w-max z-50 flex items-center gap-2 px-4 py-2 bg-stone-900/90 dark:bg-white/95 backdrop-blur-md text-white dark:text-stone-900 text-xs font-semibold rounded-full shadow-lg border border-black/[0.08] dark:border-white/20 pointer-events-none"
          >
            {notifEnabled ? (
              <Bell size={14} className="text-saffron-400 dark:text-[#d96225]" />
            ) : (
              <BellOff size={14} className="text-stone-400 dark:text-stone-500" />
            )}
            <span>{notifToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
