'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Ensure scroll is restored to top on route change without interfering with native touch gestures
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return <>{children}</>
}
