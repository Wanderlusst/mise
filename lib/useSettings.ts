'use client'

import { useState, useEffect, useSyncExternalStore, useCallback } from 'react'

// ─── Settings Types ──────────────────────────────────────────────────────────
export type DietType = 'all' | 'veg' | 'non-veg' | 'vegan' | 'jain'

export interface AllergyOption {
  id: string
  label: string
  icon?: string
  keywords: string[]
}

export const ALLERGY_OPTIONS: AllergyOption[] = [
  { id: 'peanuts',   label: 'Peanuts',    keywords: ['peanut', 'peanuts', 'groundnut', 'groundnuts'] },
  { id: 'gluten',    label: 'Gluten',     keywords: ['wheat', 'flour', 'maida', 'atta', 'gluten', 'semolina', 'sooji', 'bread', 'pasta'] },
  { id: 'dairy',     label: 'Dairy',      keywords: ['milk', 'cheese', 'paneer', 'butter', 'ghee', 'curd', 'yogurt', 'cream', 'malai'] },
  { id: 'soy',       label: 'Soy',        keywords: ['soy', 'soya', 'tofu', 'edamame', 'soy sauce'] },
  { id: 'shellfish', label: 'Shellfish',  keywords: ['shrimp', 'prawn', 'crab', 'lobster', 'shellfish'] },
  { id: 'treenuts',  label: 'Tree Nuts',  keywords: ['almond', 'badam', 'cashew', 'kaju', 'walnut', 'pistachio', 'pista'] },
]

export type RegionType = 'all' | 'North Indian' | 'South Indian' | 'East Indian' | 'West Indian'

export const REGION_OPTIONS: { id: RegionType; label: string; desc: string }[] = [
  { id: 'all',          label: 'Pan-Indian / Any', desc: 'No region preference' },
  { id: 'North Indian', label: 'North Indian',     desc: 'Rich curries, rotis, paneer' },
  { id: 'South Indian', label: 'South Indian',     desc: 'Rice, coconut, curry leaves, tamarind' },
  { id: 'East Indian',  label: 'East Indian',      desc: 'Mustard, panch phoron, fish, sweets' },
  { id: 'West Indian',  label: 'West Indian',      desc: 'Gujarati, Maharashtrian, sweet-sour notes' },
]

export const DEFAULT_PANTRY_STAPLES = [
  'Salt',
  'Cooking Oil',
  'Turmeric (Haldi)',
  'Cumin Seeds (Jeera)',
  'Mustard Seeds',
  'Red Chili Powder',
  'Black Pepper',
  'Ghee',
  'Sugar',
  'Coriander Powder',
]

export type ThemeMode = 'light' | 'dark'
export type UnitType = 'metric' | 'imperial'

export interface UserSettings {
  theme: ThemeMode
  diet: DietType
  allergies: string[]
  region: RegionType
  servings: number
  pantryStaples: string[]
  units: UnitType
  account: {
    email: string | null
    name: string
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  diet: 'all',
  allergies: [],
  region: 'all',
  servings: 2,
  pantryStaples: DEFAULT_PANTRY_STAPLES,
  units: 'metric',
  account: {
    email: null,
    name: 'Home Chef',
  },
}

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
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
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

// ─── Filter & Match Checkers ──────────────────────────────────────────────────
/**
 * Check if an ingredient violates any of the user's active allergies
 */
export function ingredientViolatesAllergies(ingredientName: string, activeAllergyIds: string[]): boolean {
  if (!activeAllergyIds || activeAllergyIds.length === 0) return false
  const lowerName = ingredientName.toLowerCase()

  for (const allergyId of activeAllergyIds) {
    const option = ALLERGY_OPTIONS.find((a) => a.id === allergyId)
    if (option) {
      for (const kw of option.keywords) {
        if (lowerName.includes(kw)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Check if an ingredient matches user's standing pantry staples
 */
export function isPantryStaple(ingredientName: string, staples: string[]): boolean {
  if (!staples || staples.length === 0) return false
  const lower = ingredientName.toLowerCase().trim()

  return staples.some((staple) => {
    // Extract base name, e.g. "Turmeric (Haldi)" -> ["turmeric", "haldi"]
    const cleanedStaple = staple.toLowerCase()
    const parts = cleanedStaple.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean)
    return parts.some((p) => lower.includes(p) || p.includes(lower))
  })
}

// ─── React Hook: useSettings ──────────────────────────────────────────────────
export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    // Sync initial mount
    setSettingsState(getStoredSettings())

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

  return {
    settings,
    updateSettings,
    updateDiet,
    toggleTheme,
    toggleAllergy,
    togglePantryStaple,
    addCustomPantryStaple,
    resetSettings,
    clearAllData,
  }
}
