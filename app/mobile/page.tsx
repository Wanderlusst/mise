'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  Menu, Bell, SlidersHorizontal, Search,
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
          <div className="relative w-full h-40 bg-stone-100">
            <Image
              src={card.image}
              alt={card.name}
              fill
              className="object-cover"
              sizes="176px"
            />
            {/* Match badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-saffron-400/90 backdrop-blur-sm rounded-pill px-2 py-0.5">
              <Star size={10} strokeWidth={2} className="text-white" fill="white" />
              <span className="text-[11px] font-semibold text-white tabular-nums">{card.match}%</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Title */}
            <p className="text-[15px] font-sans font-semibold text-stone-900 leading-snug line-clamp-2 tracking-tight">
              {card.name}
            </p>

            {/* Quick stats row */}
            <div className="flex items-center gap-2 text-stone-500">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock size={11} strokeWidth={1.5} /> {card.time}m
              </span>
              <span className="w-px h-3 bg-stone-200" />
              <span className="flex items-center gap-1 text-[11px]">
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
        className="relative w-full max-w-mobile mx-auto bg-[#ece7e4] rounded-t-[32px] p-6 pb-12 shadow-2xl z-10 border-t border-white/60"
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-6" />
        <h2 className="text-title text-stone-900 font-bold mb-6">Filter Recipes</h2>

        {/* Time filter */}
        <section className="mb-6">
          <p className="text-label text-stone-500 mb-3 uppercase tracking-wide">Max time</p>
          <div className="flex flex-wrap gap-2">
            {['5 min', '10 min', '20 min', '30 min', '45 min', 'Any'].map((t) => (
              <button
                key={t}
                className="px-4 py-2 rounded-pill text-label bg-white text-stone-700
                           hover:bg-stone-100 hover:text-stone-900 transition-colors border border-black/[0.06] shadow-2xs"
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Category filter */}
        <section className="mb-6">
          <p className="text-label text-stone-500 mb-3 uppercase tracking-wide">Category</p>
          <div className="flex flex-wrap gap-2">
            {['All', 'Drink', 'Salad', 'Yogurt', 'Snack', 'Meal'].map((c) => (
              <button
                key={c}
                className="px-4 py-2 rounded-pill text-label bg-white text-stone-700
                           hover:bg-stone-100 hover:text-stone-900 transition-colors border border-black/[0.06] shadow-2xs"
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Diet filter */}
        <section className="mb-8">
          <p className="text-label text-stone-500 mb-3 uppercase tracking-wide">Diet</p>
          <div className="flex flex-wrap gap-2">
            {['Any', 'Veg', 'Vegan', 'Non-veg', 'Jain'].map((d) => (
              <button
                key={d}
                className="px-4 py-2 rounded-pill text-label bg-white text-stone-700
                           hover:bg-stone-100 hover:text-stone-900 transition-colors border border-black/[0.06] shadow-2xs"
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={onClose}
          className="w-full h-13 rounded-pill bg-stone-900 text-white font-semibold
                     text-label-lg hover:bg-stone-800 transition-colors shadow-sm"
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
  const haptic = useHaptic()
  const greeting = getGreeting()
  const { settings } = useSettings()

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
          {/* Menu pill */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => haptic(8)}
            id="menu-btn"
            aria-label="Open menu"
            className="flex items-center justify-center w-11 h-11 rounded-pill
                       bg-white/90 backdrop-blur-glass border border-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                       text-stone-800"
          >
            <Menu size={20} strokeWidth={1.5} />
          </motion.button>

          {/* Bell + avatar grouped */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-glass border border-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-pill px-3 py-2">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => haptic(8)}
              id="notif-btn"
              aria-label="Notifications"
              className="text-stone-600 hover:text-stone-900 transition-colors"
            >
              <Bell size={20} strokeWidth={1.5} />
            </motion.button>

            <div className="w-px h-5 bg-stone-200" />

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden border-2 border-white">
              <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">A</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Hero greeting ── */}
        <motion.div variants={fadeRise} className="space-y-0.5">
          <h1 className="text-hero-sm font-bold font-sans text-stone-900 leading-tight tracking-tight">
            {greeting.headline}
          </h1>
          <p className="text-[26px] font-bold font-sans text-stone-500 leading-tight tracking-tight">
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
              className="flex-1 bg-transparent outline-none text-label-lg text-stone-800
                         placeholder:text-stone-400"
              aria-label="Search ingredients"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setFilterOpen(true); haptic(10) }}
              id="filter-btn"
              aria-label="Open filters"
              className="flex items-center justify-center w-8 h-8 rounded-full
                         bg-stone-100 hover:bg-stone-200 text-stone-700 shrink-0 transition-colors"
            >
              <SlidersHorizontal size={16} strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* Active Settings Filter Badge */}
          {(settings.diet !== 'all' || settings.allergies.length > 0 || settings.servings !== 2) && (
            <Link href="/mobile/settings" className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] text-stone-800 border border-white shadow-xs hover:bg-white transition-colors">
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
        <motion.section variants={fadeRise}>
          <div className="section-header">
            <h2 className="section-title text-stone-900">Recent tickets</h2>
            <Link href="/mobile/saved" className="see-all">See all</Link>
          </div>

          {/* Horizontal snap-scroll row */}
          <div className="snap-row -mx-5 px-5">
            {displayTickets.map((card) => (
              <TicketCardItem key={card.id} card={card} />
            ))}
          </div>
        </motion.section>

        {/* ── Featured / hero card ── */}
        <motion.section variants={fadeRise}>
          <h2 className="section-title text-stone-900 mb-4">Today&apos;s pick</h2>
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
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <p className="text-title font-sans text-stone-900 font-bold tracking-tight">{todaysPick.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-label text-stone-600">
                        <Clock size={13} strokeWidth={1.5} /> {todaysPick.time} min
                      </span>
                      <span className="flex items-center gap-1 text-label text-stone-600">
                        <Users size={13} strokeWidth={1.5} /> {todaysPick.servings} servings
                      </span>
                      <span className="flex items-center gap-1 text-label text-saffron-500 font-semibold">
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
    </>
  )
}
