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
          'relative rounded-glass border border-white/80 backdrop-blur-glass',
          variant === 'default' && 'bg-white/92 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]',
          variant === 'heavy' && 'bg-white/96 shadow-[0_12px_36px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] backdrop-blur-heavy',
          variant === 'subtle' && 'bg-white/75 shadow-[0_2px_12px_rgba(0,0,0,0.03)]',
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
