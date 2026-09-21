'use client'

import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'heavy' | 'subtle'
  padding?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', padding = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-glass transition-colors duration-200',
          'bg-[var(--bg-card)] border border-[var(--bg-card-border)]',
          padding && 'p-5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard }
