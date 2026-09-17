'use client'

import { GlassCard } from '@/components/GlassCard'
import { StatChip, StatRow } from '@/components/StatChip'
import { FloatingNav } from '@/components/FloatingNav'
import { PetalChart } from '@/components/PetalChart'
import { Leaf, Droplets, Flame, Clock, Star } from 'lucide-react'

const petalData = [
  { label: 'Rice',    value: 43 },
  { label: 'Salmon',  value: 29 },
  { label: 'Cucumber',value: 14 },
  { label: 'Lettuce', value: 4  },
  { label: 'Sesame',  value: 6  },
  { label: 'Avocado', value: 4  },
]

const exampleChips = [
  { icon: <Leaf size={14} strokeWidth={1.5} />, value: '18.2%', label: 'Carbs', iconColor: 'text-olive-600' },
  { icon: <Droplets size={14} strokeWidth={1.5} />, value: '0.5%', label: 'Fats', iconColor: 'text-saffron-400' },
  { icon: <Flame size={14} strokeWidth={1.5} />, value: '12.4%', label: 'Sugar', iconColor: 'text-red-400' },
]

export default function ComponentDebugPage() {
  return (
    <>
      <div className="mise-bg" aria-hidden />
      <main className="relative z-10 flex flex-col max-w-mobile mx-auto px-5 py-8 gap-10 pb-32">
        <h1 className="text-hero-sm text-cream-100 font-bold">Component Debug</h1>

        {/* GlassCard variants */}
        <section>
          <h2 className="text-title text-cream-200 mb-4">GlassCard</h2>
          <div className="space-y-4">
            <GlassCard>
              <p className="text-label-lg text-olive-800">Default glass card with auto padding</p>
            </GlassCard>
            <GlassCard variant="heavy">
              <p className="text-label-lg text-olive-800">Heavy variant — deeper frost</p>
            </GlassCard>
            <GlassCard variant="subtle">
              <p className="text-label-lg text-olive-800">Subtle variant — lighter opacity</p>
            </GlassCard>
            <GlassCard padding={false} className="p-6">
              <p className="text-label-lg text-olive-800">No internal padding — custom via className</p>
            </GlassCard>
          </div>
        </section>

        {/* StatChip */}
        <section>
          <h2 className="text-title text-cream-200 mb-4">StatChip &amp; StatRow</h2>
          <GlassCard>
            <div className="flex gap-4 mb-6">
              <StatChip
                icon={<Leaf size={14} strokeWidth={1.5} />}
                value="18.2%"
                label="Carbs"
                iconColor="text-olive-600"
              />
              <StatChip
                icon={<Droplets size={14} strokeWidth={1.5} />}
                value="0.5%"
                label="Fats"
                iconColor="text-saffron-400"
              />
              <StatChip
                icon={<Flame size={14} strokeWidth={1.5} />}
                value="12.4%"
                label="Sugar"
                iconColor="text-red-400"
              />
            </div>
            <StatRow chips={exampleChips} />
          </GlassCard>
        </section>

        {/* PetalChart */}
        <section>
          <h2 className="text-title text-cream-200 mb-4">PetalChart</h2>
          <GlassCard variant="heavy" className="flex justify-center py-6">
            <PetalChart
              data={petalData}
              centerLabel="Bowl"
              size={260}
            />
          </GlassCard>
        </section>

        {/* Design tokens */}
        <section>
          <h2 className="text-title text-cream-200 mb-4">Color Palette</h2>
          <GlassCard>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {['bg-olive-900','bg-olive-800','bg-olive-700','bg-olive-600','bg-olive-500','bg-olive-400','bg-olive-300','bg-olive-200','bg-olive-100','bg-olive-50'].map(c => (
                <div key={c} className={`${c} h-10 rounded-lg`} title={c} />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {['bg-saffron-600','bg-saffron-500','bg-saffron-400','bg-saffron-300','bg-saffron-200'].map(c => (
                <div key={c} className={`${c} h-10 rounded-lg`} title={c} />
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-title text-cream-200 mb-4">Typography</h2>
          <GlassCard className="space-y-3">
            <p className="text-hero text-olive-900">Hero 40px bold</p>
            <p className="text-hero-sm text-olive-900">Hero SM 32px bold</p>
            <p className="text-display text-olive-900">Display 28px bold</p>
            <p className="text-title text-olive-900">Title 22px semibold</p>
            <p className="text-label-lg text-olive-700">Label LG 15px medium</p>
            <p className="text-label text-olive-600">Label 13px medium</p>
            <p className="text-label-sm text-olive-500">Label SM 11px medium</p>
            <p className="text-stat text-olive-800 tabular-nums">Stat 22px 94.5%</p>
            <p className="text-stat-sm text-olive-700 tabular-nums">Stat SM 16px 94.5%</p>
          </GlassCard>
        </section>
      </main>

      <FloatingNav />
    </>
  )
}
