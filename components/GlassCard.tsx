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
          'relative rounded-glass border border-white/80 dark:border-white/10 backdrop-blur-glass transition-colors duration-200',
          variant === 'default' && 'bg-white/92 dark:bg-[#2c2c2c]/95 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          variant === 'heavy' && 'bg-white/96 dark:bg-[#2c2c2c]/98 shadow-[0_12px_36px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-heavy',
          variant === 'subtle' && 'bg-white/75 dark:bg-[#2c2c2c]/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
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
