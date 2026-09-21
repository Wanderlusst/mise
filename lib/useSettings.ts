'use client'

import { useState, useEffect, useSyncExternalStore, useCallback } from 'react'

export * from './settingsUtils'
import {
  UserSettings,
  DEFAULT_SETTINGS,
  ThemeMode,
  RegionType,
  DietType,
} from './settingsUtils'

const SETTINGS_STORAGE_KEY = 'mise_user_settings_v1'
const SETTINGS_CHANGE_EVENT = 'mise_settings_changed'

// ─── Storage Helpers ─────────────────────────────────────────────────────────
export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      account: { ...DEFAULT_SETTINGS.account, ...(parsed.account || {}) },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function applyThemeClass(theme: ThemeMode): void {
  if (typeof window === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  if (document.body) {
    document.body.setAttribute('data-theme', theme)
  }

  const isDark = theme === 'dark'
  const bgColor = isDark ? '#211E19' : '#F7F2E9'

  if (isDark) {
    document.documentElement.classList.add('dark')
    if (document.body) document.body.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    if (document.body) document.body.classList.remove('dark')
  }

  // Set explicit background color immediately to avoid any white flash during navigation
  document.documentElement.style.backgroundColor = bgColor
  if (document.body) {
    document.body.style.backgroundColor = bgColor
  }

  // Update meta theme-color for browser address bar & PWA status bar
  const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]')
  metaThemeColors.forEach((el) => {
    el.setAttribute('content', bgColor)
  })
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    applyThemeClass(settings.theme)
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: settings }))
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err)
  }
}


// ─── React Hook: useSettings ──────────────────────────────────────────────────
export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(() => {
    if (typeof window !== 'undefined') {
      return getStoredSettings()
    }
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    // Ensure theme class is applied on mount
    applyThemeClass(settings.theme)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        setSettingsState(getStoredSettings())
      }
    }

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserSettings>
      if (customEvent.detail) {
        setSettingsState(customEvent.detail)
      } else {
        setSettingsState(getStoredSettings())
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(SETTINGS_CHANGE_EVENT, handleCustomChange)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleCustomChange)
    }
  }, [])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettingsState((prev) => {
      const next: UserSettings = {
        ...prev,
        ...updates,
      }
      saveSettings(next)
      return next
    })
  }, [])

  const toggleAllergy = useCallback((allergyId: string) => {
    setSettingsState((prev) => {
      const exists = prev.allergies.includes(allergyId)
      const nextAllergies = exists
        ? prev.allergies.filter((id) => id !== allergyId)
        : [...prev.allergies, allergyId]
      const next = { ...prev, allergies: nextAllergies }
      saveSettings(next)
      return next
    })
  }, [])

  const togglePantryStaple = useCallback((staple: string) => {
    setSettingsState((prev) => {
      const exists = prev.pantryStaples.some((s) => s.toLowerCase() === staple.toLowerCase())
      const nextStaples = exists
        ? prev.pantryStaples.filter((s) => s.toLowerCase() !== staple.toLowerCase())
        : [...prev.pantryStaples, staple]
      const next = { ...prev, pantryStaples: nextStaples }
      saveSettings(next)
      return next
    })
  }, [])

  const addCustomPantryStaple = useCallback((customStaple: string) => {
    const trimmed = customStaple.trim()
    if (!trimmed) return
    setSettingsState((prev) => {
      if (prev.pantryStaples.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        return prev
      }
      const next = { ...prev, pantryStaples: [...prev.pantryStaples, trimmed] }
      saveSettings(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS)
    setSettingsState(DEFAULT_SETTINGS)
  }, [])

  const clearAllData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      localStorage.removeItem('mise_saved_recipes_v2')
      localStorage.removeItem('mise_saved_recipes_v1')
      localStorage.removeItem('mise_saved_recipes')
      localStorage.removeItem('mise_scanned_ingredients_v1')
      localStorage.removeItem('mise_active_cooking_v1')
      localStorage.removeItem('mise_recent_searches')
      saveSettings(DEFAULT_SETTINGS)
      setSettingsState(DEFAULT_SETTINGS)

      window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT))
      window.dispatchEvent(new Event('mise_saved_recipes_changed'))
      window.dispatchEvent(new Event('mise_pantry_changed'))
      window.dispatchEvent(new Event('mise_active_cooking_changed'))
    }
  }, [])

  useEffect(() => {
    applyThemeClass(settings.theme)
  }, [settings.theme])

  const toggleTheme = useCallback(() => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  }, [settings.theme, updateSettings])

  const updateDiet = useCallback((diet: DietType) => {
    updateSettings({ diet })
  }, [updateSettings])

  const updateRegion = useCallback((region: RegionType) => {
    updateSettings({ region })
  }, [updateSettings])

  return {
    settings,
    updateSettings,
    updateDiet,
    updateRegion,
    toggleTheme,
    toggleAllergy,
    togglePantryStaple,
    addCustomPantryStaple,
    resetSettings,
    clearAllData,
  }
}



