'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ActiveCookingSession {
  recipeId: string
  recipeName: string
  recipeImage: string
  currentStepIndex: number
  totalSteps: number
  totalRemainingMinutes: number
  currentInstruction?: string
  lastUpdated: string
  deviceUserId?: string
}

const ACTIVE_COOKING_STORAGE_KEY = 'mise_active_cooking_v1'
const ACTIVE_COOKING_EVENT = 'mise_active_cooking_changed'

function loadSession(): ActiveCookingSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ACTIVE_COOKING_STORAGE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function useActiveCooking() {
  const [session, setSession] = useState<ActiveCookingSession | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setSession(loadSession())
    setIsHydrated(true)
    const refresh = () => setSession(loadSession())
    window.addEventListener(ACTIVE_COOKING_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(ACTIVE_COOKING_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const startSession = useCallback((newSession: ActiveCookingSession) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACTIVE_COOKING_STORAGE_KEY, JSON.stringify(newSession))
    window.dispatchEvent(new Event(ACTIVE_COOKING_EVENT))
    setSession(newSession)
  }, [])

  const updateProgress = useCallback((stepIndex: number, remainingMinutes?: number, instruction?: string) => {
    if (typeof window === 'undefined') return
    setSession((prev) => {
      if (!prev) return null
      const updated: ActiveCookingSession = {
        ...prev,
        currentStepIndex: stepIndex,
        totalRemainingMinutes: remainingMinutes ?? Math.max(1, prev.totalRemainingMinutes - 3),
        currentInstruction: instruction ?? prev.currentInstruction,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(ACTIVE_COOKING_STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event(ACTIVE_COOKING_EVENT))
      return updated
    })
  }, [])

  const clearSession = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACTIVE_COOKING_STORAGE_KEY)
    window.dispatchEvent(new Event(ACTIVE_COOKING_EVENT))
    setSession(null)
  }, [])

  return {
    session,
    startSession,
    updateProgress,
    clearSession,
  }
}
