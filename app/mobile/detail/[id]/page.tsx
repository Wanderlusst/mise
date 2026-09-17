'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Bookmark, Clock, Users, Leaf, Droplets, Flame } from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { StatRow } from '@/components/StatChip'
import { PetalChart } from '@/components/PetalChart'
import { useHaptic } from '@/lib/useHaptic'

// ── Mock detail data (keyed by id) ────────────────────────────────
const DETAILS: Record<string, {
  id: string
  name: string
  weight: string
  servings: number
  image: string
  heroImage: string
  petalData: Array<{ label: string; value: number; color?: string }>
  ingredients: Array<{
    name: string
    image: string
    quantity: string
    chips: Array<{ icon: React.ReactNode; value: string; label: string; iconColor?: string }>
  }>
}> = {
  'bowl-001': {
    id: 'bowl-001',
    name: 'Salmon Rice Bowl',
    weight: '350 g',
    servings: 2,
    image: '/food/bowl.jpg',
    heroImage: '/food/bowl.jpg',
    petalData: [
      { label: 'Rice',      value: 43 },
      { label: 'Salmon',    value: 29 },
      { label: 'Cucumber',  value: 14 },
      { label: 'Lettuce',   value: 4  },
      { label: 'Sesame',    value: 6  },
      { label: 'Avocado',   value: 4  },
    ],
    ingredients: [
      {
        name: 'Rice',
        image: '/food/bowl.jpg',
        quantity: '150 g',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '33 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '0.3 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '0.1 g', label: 'Sugar', iconColor: 'text-red-400' },
        ],
      },
      {
        name: 'Salmon',
        image: '/food/bowl.jpg',
        quantity: '100 g',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '0.0 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '13 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '0.0 g', label: 'Sugar', iconColor: 'text-red-400' },
        ],
      },
      {
        name: 'Avocado',
        image: '/food/salad.jpg',
        quantity: '60 g',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '4 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '9 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '0.3 g', label: 'Sugar', iconColor: 'text-red-400' },
        ],
      },
    ],
  },
  'pasta-001': {
    id: 'pasta-001',
    name: 'Spicy Tomato Fusilli',
    weight: '280 g',
    servings: 2,
    image: '/food/pasta.jpg',
    heroImage: '/food/pasta.jpg',
    petalData: [
      { label: 'Pasta',    value: 55 },
      { label: 'Tomato',   value: 22 },
      { label: 'Olive Oil',value: 12 },
      { label: 'Basil',    value: 6  },
      { label: 'Parmesan', value: 5  },
    ],
    ingredients: [
      {
        name: 'Fusilli Pasta',
        image: '/food/pasta.jpg',
        quantity: '150 g',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '58 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '1.3 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '2.1 g', label: 'Sugar', iconColor: 'text-red-400' },
        ],
      },
      {
        name: 'Cherry Tomatoes',
        image: '/food/pasta.jpg',
        quantity: '80 g',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '3.9 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '0.2 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '2.6 g', label: 'Sugar', iconColor: 'text-red-400' },
        ],
      },
    ],
  },
}

// Fallback for unmapped ids
const FALLBACK_ID = 'bowl-001'

// ── Ingredient row ─────────────────────────────────────────────────
function IngredientRow({ item }: { item: typeof DETAILS['bowl-001']['ingredients'][0] }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-200 last:border-0">
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>

      {/* Name + quantity */}
      <div className="flex-1 min-w-0">
        <p className="text-label-lg text-stone-900 font-semibold truncate">{item.name}</p>
        <p className="text-label font-mono text-stone-500 mt-0.5">{item.quantity}</p>
        {/* Mini stat row */}
        <div className="flex gap-3 mt-1.5">
          {item.chips.map((chip, i) => (
            <span key={i} className={`flex items-center gap-1 text-[11px] font-medium tabular-nums ${chip.iconColor ?? 'text-stone-600'}`}>
              {chip.icon} {chip.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Screen 3: Result Detail ────────────────────────────────────────
export default function DetailPage({ params }: { params: { id: string } }) {
  const detail = DETAILS[params.id] ?? DETAILS[FALLBACK_ID]
  const [bookmarked, setBookmarked] = useState(false)
  const haptic = useHaptic()

  const handleBookmark = () => {
    haptic([12, 8])  // double pulse
    setBookmarked((prev) => !prev)
  }

  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col px-5 pb-44 gap-6 min-h-screen"
      style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        {/* Back */}
        <motion.div whileTap={{ scale: 0.92 }}>
          <Link
            href="/mobile"
            id="back-btn"
            aria-label="Go back"
            className="flex items-center justify-center w-11 h-11 rounded-full
                       bg-white/80 backdrop-blur-glass border border-white/60 shadow-glass-sm
                       text-stone-700"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
        </motion.div>

        {/* Bookmark */}
        <motion.button
          id="bookmark-btn"
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          onClick={handleBookmark}
          whileTap={{ scale: 0.88 }}
          className="flex items-center justify-center w-11 h-11 rounded-full
                     bg-white/80 backdrop-blur-glass border border-white/60 shadow-glass-sm
                     text-stone-700"
        >
          <motion.div
            animate={{ scale: bookmarked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
          >
            <Bookmark
              size={20}
              strokeWidth={1.5}
              fill={bookmarked ? '#5C6B3D' : 'none'}
              className={bookmarked ? 'text-stone-600' : 'text-stone-600'}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Petal chart ── */}
      <GlassCard variant="heavy" className="flex flex-col items-center py-6">
        <PetalChart
          data={detail.petalData}
          centerImage={detail.heroImage}
          size={260}
        />

        {/* Name + info below chart */}
        <div className="text-center mt-4">
          <h1 className="text-display font-sans text-stone-900 font-bold tracking-tight">{detail.name}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-stone-500">
            <span className="flex items-center gap-1.5 text-label">
              <span className="font-medium font-mono text-stone-700">{detail.weight}</span>
            </span>
            <span className="w-px h-4 bg-stone-200" />
            <span className="flex items-center gap-1.5 text-label">
              <Users size={14} strokeWidth={1.5} />
              <span className="font-medium text-stone-700">{detail.servings} servings</span>
            </span>
          </div>
        </div>
      </GlassCard>

      {/* ── Ingredient list ── */}
      <section>
        <div className="section-header">
          <h2 className="section-title text-stone-900">Ingredients</h2>
          <span className="text-label text-stone-400">{detail.ingredients.length} items</span>
        </div>
        <GlassCard className="divide-y divide-stone-100 overflow-hidden" padding={false}>
          <div className="px-4">
            {detail.ingredients.map((ing, i) => (
              <IngredientRow key={i} item={ing} />
            ))}
          </div>
        </GlassCard>
      </section>

      {/* ── CTA ── */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <Link
          href={`/steps/${detail.id}`}
          id="start-cooking-btn"
          className="flex items-center justify-center w-full h-14 rounded-pill
                     bg-stone-800 text-white font-semibold text-label-lg
                     hover:bg-stone-700 transition-colors shadow-glass-heavy"
        >
          <Clock size={18} strokeWidth={1.5} className="mr-2" />
          Start Cooking
        </Link>
      </motion.div>
    </motion.main>
  )
}
