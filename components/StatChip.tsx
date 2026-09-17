'use client'

import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface StatChipProps {
  icon: ReactNode
  value: string
  label: string
  iconColor?: string
  className?: string
}

export function StatChip({ icon, value, label, iconColor, className }: StatChipProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 flex-1',
        className
      )}
    >
      {/* icon inside a small pill */}
      <span
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-chip bg-stone-100/90',
          iconColor
        )}
      >
        {icon}
      </span>
      {/* numeric value */}
      <span className="text-stat-sm font-semibold tabular-nums text-stone-900">
        {value}
      </span>
      {/* label */}
      <span className="text-label-sm font-medium text-stone-500 uppercase tracking-wide">
        {label}
      </span>
    </div>
  )
}

/** Three chips in a row, shared width */
interface StatRowProps {
  chips: Array<{ icon: ReactNode; value: string; label: string; iconColor?: string }>
  className?: string
}

export function StatRow({ chips, className }: StatRowProps) {
  return (
    <div className={cn('flex items-stretch gap-2', className)}>
      {chips.map((chip, i) => (
        <StatChip key={i} {...chip} />
      ))}
    </div>
  )
}
