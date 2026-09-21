'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Droplets, AlertOctagon, Lightbulb } from 'lucide-react'
import { ShelfLifeCardData } from '@/lib/chefMiseEngine'

interface ShelfLifeCardProps {
  data: ShelfLifeCardData
}

export function ShelfLifeCard({ data }: ShelfLifeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--bg-card-border)] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] flex items-center justify-center">
            <Calendar size={14} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[var(--text-primary)]">
              {data.item}
            </h4>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              Kitchen Storage Science
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-[var(--success-bg)] text-[var(--success)] text-[10px] font-bold">
          {data.freshDuration}
        </span>
      </div>

      {/* Storage Method */}
      <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">Storage Rule: </span>
        {data.storageMethod}
      </p>

      {/* Water Immersion Hack */}
      {data.waterImmersionTrick && (
        <div className="p-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-[11.5px] leading-relaxed text-[var(--text-primary)] flex items-start gap-2">
          <Droplets size={15} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">The Water Immersion Trick: </span>
            <span>{data.waterImmersionTrick}</span>
          </div>
        </div>
      )}

      {/* Spoilage Warnings */}
      <div className="p-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-primary)]">
          <AlertOctagon size={13} className="text-[var(--accent)]" />
          <span>How to Spot Spoilage</span>
        </div>
        <div className="text-[10.5px] space-y-1 text-[var(--text-secondary)]">
          <p>
            <strong>Smell: </strong>
            {data.spoilageCheck.smell}
          </p>
          <p>
            <strong>Texture: </strong>
            {data.spoilageCheck.texture}
          </p>
          <p>
            <strong>Look: </strong>
            {data.spoilageCheck.appearance}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
