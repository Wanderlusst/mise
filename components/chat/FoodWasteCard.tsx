'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, ArrowRight, ShieldCheck, ChefHat } from 'lucide-react'
import { FoodWasteCardData } from '@/lib/chefMiseEngine'
import { useHaptic } from '@/lib/useHaptic'

interface FoodWasteCardProps {
  data: FoodWasteCardData
  onSelectRecipe?: (recipeName: string) => void
}

export function FoodWasteCard({ data, onSelectRecipe }: FoodWasteCardProps) {
  const haptic = useHaptic()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] p-4 space-y-3.5"
    >
      {/* Waste Rescue Header */}
      <div className="flex items-center justify-between border-b border-[var(--bg-card-border)] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Zero Food Waste Alert</span>
            </h4>
            <span className="text-[10.5px] text-[var(--accent-text-on-light)] font-medium">
              {data.expiringItem} • Best within {data.daysLeft} days
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] text-[10px] font-bold">
          High Urgency
        </span>
      </div>

      <p className="text-[11.5px] text-[var(--text-secondary)]">
        Rescue these ingredients now with these 3 lightning-fast chef recipes:
      </p>

      {/* 3 Rescue Recipe Options */}
      <div className="space-y-2">
        {data.rescueOptions.map((opt, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              haptic(10)
              onSelectRecipe?.(opt.name)
            }}
            className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] hover:border-[var(--accent)] transition-colors cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[var(--bg-card)]">
              <Image src={opt.image} alt={opt.name} fill sizes="48px" className="object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                  {opt.name}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] shrink-0 flex items-center gap-0.5">
                  <Clock size={10} /> {opt.time}m
                </span>
              </div>
              <p className="text-[10.5px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                {opt.whyItSaves}
              </p>
            </div>

            <div className="w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] flex items-center justify-center shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              <ArrowRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Storage Extension Pro-Tip */}
      {data.storageExtensionTip && (
        <div className="p-2.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] flex items-start gap-2">
          <ShieldCheck size={14} className="text-[var(--success)] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">To Extend Shelf Life: </span>
            {data.storageExtensionTip}
          </p>
        </div>
      )}
    </motion.div>
  )
}
