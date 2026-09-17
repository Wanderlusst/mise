'use client'

import { useCallback } from 'react'

export function useHaptic() {
  const trigger = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern)
      } catch {
        // silent no-op on browsers that throw (e.g. iOS Safari)
      }
    }
  }, [])

  return trigger
}
