'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, Clock, Users, Leaf, Droplets, Flame } from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { PetalChart } from '@/components/PetalChart'
import IngredientThumbnail from '@/components/IngredientThumbnail'
import { useHaptic } from '@/lib/useHaptic'
import { useSavedRecipes } from '@/lib/useSavedRecipes'

// ── Mock detail data fallback ─────────────────────────────────────
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
    name: 'Quinoa Veggie Bowl',
    weight: '350 g',
    servings: 2,
    image: '/food/salad.jpg',
    heroImage: '/food/salad.jpg',
    petalData: [
      { label: 'Quinoa',    value: 40 },
      { label: 'Avocado',   value: 25 },
      { label: 'Tomato',    value: 15 },
      { label: 'Cucumber',  value: 10 },
      { label: 'Spinach',   value: 10 },
    ],
    ingredients: [
      {
        name: 'Quinoa',
        image: '/food/salad.jpg',
        quantity: '1 cup',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '39 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '3.6 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '1.6 g', label: 'Sugar', iconColor: 'text-red-400' },
        ],
      },
      {
        name: 'Avocado',
        image: '/food/salad.jpg',
        quantity: '1 medium',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '9 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '15 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '0.7 g', label: 'Sugar', iconColor: 'text-red-400' },
        ],
      },
      {
        name: 'Cherry Tomatoes',
        image: '/food/salad.jpg',
        quantity: '1/2 cup',
        chips: [
          { icon: <Leaf size={12} strokeWidth={1.5} />, value: '4 g', label: 'Carbs', iconColor: 'text-stone-600' },
          { icon: <Droplets size={12} strokeWidth={1.5} />, value: '0.2 g', label: 'Fats', iconColor: 'text-saffron-400' },
          { icon: <Flame size={12} strokeWidth={1.5} />, value: '2.6 g', label: 'Sugar', iconColor: 'text-red-400' },
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
    ],
  },
}

const FALLBACK_ID = 'bowl-001'

// ── Screen 3: Result Detail ────────────────────────────────────────
export default function DetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const haptic = useHaptic()
  const { isSaved, toggleSave, getSavedRecipe } = useSavedRecipes()

  const savedRecipe = getSavedRecipe(params.id)
  const bookmarked = isSaved(params.id)

  const detail = useMemo(() => {
    if (savedRecipe) {
      const ingList = savedRecipe.ingredients || []
      const equalPetal = Math.max(10, Math.round(100 / Math.max(1, ingList.length)))
      return {
        id: savedRecipe.id,
        name: savedRecipe.name,
        weight: `${savedRecipe.calories} kcal`,
        servings: savedRecipe.servings || 2,
        time: savedRecipe.time,
        image: savedRecipe.image,
        heroImage: savedRecipe.image,
        petalData: ingList.length > 0
          ? ingList.map((i) => ({
              label: i.name.split(' ')[0] || i.name,
              value: equalPetal,
            }))
          : [{ label: 'Fresh', value: 100 }],
        ingredients: ingList.map((i) => ({
          name: i.name,
          image: savedRecipe.image,
          quantity: i.quantity,
          chips: [
            { icon: <Leaf size={12} strokeWidth={1.5} />, value: 'Fresh', label: 'Produce', iconColor: 'text-stone-600' },
            { icon: <Droplets size={12} strokeWidth={1.5} />, value: 'Clean', label: 'Healthy', iconColor: 'text-saffron-400' },
          ],
        })),
        steps: savedRecipe.steps,
      }
    }

    return DETAILS[params.id] ?? DETAILS[FALLBACK_ID]
  }, [savedRecipe, params.id])

  const handleBookmark = () => {
    haptic([12, 8])
    if (savedRecipe) {
      toggleSave(savedRecipe)
    } else {
      toggleSave({
        id: detail.id,
        name: detail.name,
        image: detail.heroImage,
        time: 25,
        servings: detail.servings,
      })
    }
  }

  const ingParams = encodeURIComponent(detail.ingredients.map((i) => i.name).join(','))
  const cookingHref = `/steps/${detail.id}?ingredients=${ingParams}&servings=${detail.servings}`

  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col px-5 pb-44 gap-6 min-h-screen max-w-mobile mx-auto"
      style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between pt-4">
        {/* Back */}
        <motion.div whileTap={{ scale: 0.92 }}>
          <button
            onClick={() => router.back()}
            id="back-btn"
            aria-label="Go back"
            className="flex items-center justify-center w-11 h-11 rounded-full
                       bg-white/80 dark:bg-[#2c2c2c]/90 backdrop-blur-glass border border-white/60 dark:border-white/10 shadow-glass-sm
                       text-stone-700 dark:text-stone-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
        </motion.div>

        {/* Bookmark */}
        <motion.button
          id="bookmark-btn"
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          onClick={handleBookmark}
          whileTap={{ scale: 0.88 }}
          className="flex items-center justify-center w-11 h-11 rounded-full
                     bg-white/80 dark:bg-[#2c2c2c]/90 backdrop-blur-glass border border-white/60 dark:border-white/10 shadow-glass-sm
                     text-stone-700 dark:text-stone-100 transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ scale: bookmarked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
          >
            <Bookmark
              size={20}
              strokeWidth={1.5}
              fill={bookmarked ? '#ffa371' : 'none'}
              className={bookmarked ? 'text-[#ffa371]' : 'text-stone-600 dark:text-stone-300'}
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
        <div className="text-center mt-4 px-2">
          <h1 className="text-display font-apple text-stone-900 dark:text-white font-bold tracking-tight">{detail.name}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 text-label">
              <span className="font-medium font-mono text-stone-700 dark:text-stone-300">{detail.weight}</span>
            </span>
            <span className="w-px h-4 bg-stone-200 dark:bg-stone-700" />
            <span className="flex items-center gap-1.5 text-label">
              <Users size={14} strokeWidth={1.5} />
              <span className="font-medium text-stone-700 dark:text-stone-300">{detail.servings} servings</span>
            </span>
          </div>
        </div>
      </GlassCard>

      {/* ── Ingredient list ── */}
      <section>
        <div className="section-header mb-3 flex items-center justify-between">
          <h2 className="section-title text-stone-900 dark:text-white font-bold text-lg">Ingredients</h2>
          <span className="text-sm font-medium text-stone-400 dark:text-stone-500">{detail.ingredients.length} items</span>
        </div>
        <GlassCard className="divide-y divide-stone-100 dark:divide-white/5 overflow-hidden" padding={false}>
          <div className="px-4">
            {detail.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3.5 py-3 border-b border-stone-200 dark:border-white/5 last:border-0">
                <IngredientThumbnail name={ing.name} size={64} className="rounded-xl shadow-xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-900 dark:text-white font-semibold truncate capitalize">{ing.name}</p>
                  <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">{ing.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* ── CTA ── */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <Link
          href={cookingHref}
          id="start-cooking-btn"
          className="flex items-center justify-center w-full h-14 rounded-pill
                     bg-stone-900 dark:bg-[#ffa371] text-white dark:text-[#2c2c2c] font-bold text-label-lg
                     hover:bg-stone-800 dark:hover:bg-[#ffb38a] transition-colors shadow-glass-heavy"
        >
          <Clock size={18} strokeWidth={1.5} className="mr-2" />
          Start Cooking
        </Link>
      </motion.div>
    </motion.main>
  )
}
