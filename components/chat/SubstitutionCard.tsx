'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, ArrowRightLeft, Sparkles, ChefHat } from 'lucide-react'
import { SubstitutionCardData } from '@/lib/chefMiseEngine'

interface SubstitutionCardProps {
  data: SubstitutionCardData
  onSelectSwap?: (swapName: string) => void
}

export function SubstitutionCard({ data, onSelectSwap }: SubstitutionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] p-4 space-y-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--bg-card-border)] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] flex items-center justify-center">
            <ArrowRightLeft size={14} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[var(--text-primary)]">
              Substitutes for {data.originalIngredient}
            </h4>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              Chef-Verified Culinary Swaps
            </span>
          </div>
        </div>

        {data.canOmit && (
          <span className="px-2 py-0.5 rounded-full bg-[var(--success-bg)] text-[var(--success)] text-[10px] font-bold border border-[var(--success)]/20">
            Can Omit
          </span>
        )}
      </div>

      {/* Omit Verdict if available */}
      {data.omitVerdict && (
        <div className="p-2.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-[11.5px] leading-relaxed text-[var(--text-primary)] flex items-start gap-2">
          <CheckCircle size={14} className="text-[var(--success)] shrink-0 mt-0.5" />
          <span>{data.omitVerdict}</span>
        </div>
      )}

      {/* Swaps Grid */}
      <div className="space-y-2">
        {data.swaps.map((swap, idx) => (
          <div
            key={idx}
            onClick={() => onSelectSwap?.(swap.name)}
            className="p-3 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] hover:border-[var(--accent)] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {swap.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-secondary)] font-medium border border-[var(--bg-card-border)]">
                {swap.ratio}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
              {swap.flavorNote}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1 italic">
              Best for: {swap.bestFor}
            </p>
          </div>
        ))}
      </div>

      {/* Chef Pro Tip */}
      {data.chefProTip && (
        <div className="pt-2 border-t border-[var(--bg-card-border)] flex items-start gap-2">
          <ChefHat size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <p className="text-[10.5px] leading-relaxed text-[var(--text-secondary)] italic">
            <span className="font-semibold not-italic text-[var(--text-primary)]">Chef's Secret: </span>
            {data.chefProTip}
          </p>
        </div>
      )}
    </motion.div>
  )
}
