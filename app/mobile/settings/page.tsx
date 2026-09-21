'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf,
  Compass,
  Users,
  Package,
  Scale,
  User,
  Trash2,
  ChevronRight,
  Plus,
  Minus,
  Check,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Utensils,
  Beef,
  Salad,
  Sparkles,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase/client'
import {
  useSettings,
  DietType,
  RegionType,
  UnitType,
  ALLERGY_OPTIONS,
  REGION_OPTIONS,
} from '@/lib/useSettings'
import { useHaptic } from '@/lib/useHaptic'

// ─── Preset Diet Options ───────────────────────────────────────────────────────
const DIET_OPTIONS: { id: DietType; label: string; icon: LucideIcon; desc: string }[] = [
  { id: 'all',     label: 'All Diets',  icon: Utensils, desc: 'No restrictions' },
  { id: 'veg',     label: 'Vegetarian', icon: Leaf, desc: 'Plant-based & dairy, no meat' },
  { id: 'non-veg', label: 'Non-Veg',    icon: Beef, desc: 'Includes chicken, fish & eggs' },
  { id: 'vegan',   label: 'Vegan',      icon: Salad, desc: 'Strictly 100% plant-based' },
  { id: 'jain',    label: 'Jain',       icon: Sparkles, desc: 'No root vegetables, onion, garlic' },
]

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    toggleTheme,
    toggleAllergy,
    togglePantryStaple,
    addCustomPantryStaple,
    resetSettings,
    clearAllData,
  } = useSettings()
  const { user, isAnonymous, openSignInSheet, signOut } = useAuth()

  const haptic = useHaptic()

  // Expanded accordion section state (collapsed by default like iOS Settings)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [newStapleInput, setNewStapleInput] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const toggleSection = (id: string) => {
    haptic(8)
    setExpandedSection((prev) => (prev === id ? null : id))
  }

  const handleAddStaple = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStapleInput.trim()) return
    addCustomPantryStaple(newStapleInput.trim())
    setNewStapleInput('')
    haptic(12)
    showToast('Pantry staple added')
  }

  // Active diet label
  const currentDietObj = DIET_OPTIONS.find((d) => d.id === settings.diet) || DIET_OPTIONS[0]
  const allergyCount = settings.allergies.length

  return (
    <main className="min-h-screen px-4 pt-12 pb-36 max-w-mobile mx-auto">
      {/* ── Header ── */}
      <header className="mb-6 px-1">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-apple transition-colors">
          Profile & Settings
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Personalize your culinary kitchen OS & preferences
        </p>
      </header>

      {/* ── Section Group 0: Appearance & Dark Mode ── */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-2">
          Appearance
        </p>

        <div className="bg-[var(--bg-card)] border border-[var(--bg-card-border)] rounded-[24px] p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--accent)] flex items-center justify-center text-white shadow-sm">
                {settings.theme === 'dark' ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
              </div>
              <span className="text-[15px] font-semibold text-[var(--text-primary)] block leading-tight">
                Dark Mode
              </span>
            </div>

            {/* iOS-style toggle switch */}
            <button
              onClick={() => {
                haptic(10)
                toggleTheme()
              }}
              aria-label="Toggle Dark Mode"
              className={`w-14 h-8 p-1 rounded-full transition-colors duration-200 flex items-center ${
                settings.theme === 'dark' ? 'bg-[var(--accent)]' : 'bg-[var(--bg-card-border)]'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`w-6 h-6 rounded-full shadow-md ${
                  settings.theme === 'dark' ? 'bg-[var(--bg-card)] ml-auto' : 'bg-white mr-auto'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Section Group 1: Culinary Preferences ── */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-2">
          Cooking & Matching Rules
        </p>

        <div className="bg-[var(--bg-card)] border border-[var(--bg-card-border)] rounded-[24px] overflow-hidden transition-colors">
          {/* ── 1. Diet & Restrictions ── */}
          <div className="transition-colors">
            <button
              onClick={() => toggleSection('diet')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-black/[0.015] active:bg-black/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm">
                  <Leaf size={19} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-[var(--text-primary)] block leading-tight">
                    Diet & Restrictions
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5">
                    {currentDietObj.label}
                    {allergyCount > 0 && ` · ${allergyCount} allergy flags`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-[var(--text-secondary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    expandedSection === 'diet' ? 'rotate-90 text-[var(--accent)]' : ''
                  }`}
                />
              </div>
            </button>

            <div
              className={`accordion-grid ${expandedSection === 'diet' ? 'is-open' : ''}`}
            >
              <div className="accordion-grid-inner">
                <div className="accordion-content border-t border-[var(--bg-card-border)] bg-[var(--bg-page)]/40">
                  <div className="p-4 space-y-4">
                    {/* Diet Selector */}
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-2">
                        Primary Diet Pattern
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {DIET_OPTIONS.map((opt) => {
                          const isSelected = settings.diet === opt.id
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                haptic(10)
                                updateSettings({ diet: opt.id })
                                showToast(`Diet updated to ${opt.label}`)
                              }}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs font-medium'
                                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--bg-card-border)] hover:bg-[var(--bg-page)]'
                              }`}
                            >
                              <opt.icon size={16} className={isSelected ? 'text-white' : 'text-[var(--accent-text-on-light)]'} />
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold leading-tight truncate">
                                  {opt.label}
                                </p>
                                <p
                                  className={`text-[10px] truncate ${
                                    isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'
                                  }`}
                                >
                                  {opt.desc}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Allergy Flags */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                          Allergy Flags (Auto-Filter)
                        </p>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          Eliminates matching recipes
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALLERGY_OPTIONS.map((allergy) => {
                          const isActive = settings.allergies.includes(allergy.id)
                          return (
                            <button
                              key={allergy.id}
                              onClick={() => {
                                haptic(10)
                                toggleAllergy(allergy.id)
                                showToast(
                                  isActive
                                    ? `Removed ${allergy.label} filter`
                                    : `Filtering out ${allergy.label}`
                                )
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                                isActive
                                  ? 'bg-[var(--accent)] text-white border border-[var(--accent)] shadow-xs'
                                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--bg-card-border)] hover:bg-[var(--bg-page)]'
                              }`}
                            >
                              <span>{allergy.label}</span>
                              {isActive && <Check size={12} className="text-white" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11.5px] text-[var(--success)] bg-[var(--success-bg)] p-2.5 rounded-xl border border-[var(--success)]/20">
                      <ShieldCheck size={16} className="text-[var(--success)] shrink-0" />
                      <span>
                        These filters are active across all match engines, searches, and recipe recommendations.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-16 mr-4 h-px bg-[var(--bg-card-border)]" />

          {/* ── 2. Region Preference (Tiebreaker) ── */}
          <div className="transition-colors">
            <button
              onClick={() => toggleSection('region')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-black/[0.015] active:bg-black/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center text-white shadow-sm">
                  <Compass size={19} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-[var(--text-primary)] block leading-tight">
                    Region Preference
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5">
                    {settings.region === 'all'
                      ? 'Pan-Indian / Any'
                      : `${settings.region} Cuisine`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-[var(--text-secondary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    expandedSection === 'region' ? 'rotate-90 text-[var(--accent)]' : ''
                  }`}
                />
              </div>
            </button>

            <div
              className={`accordion-grid ${expandedSection === 'region' ? 'is-open' : ''}`}
            >
              <div className="accordion-grid-inner">
                <div className="accordion-content border-t border-[var(--bg-card-border)] bg-[var(--bg-page)]/40">
                  <div className="p-4 space-y-2.5">
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2">
                      When recipes have equal ingredient match scores, Mise gives precedence to your favorite regional cuisine.
                    </p>
                    <div className="space-y-1.5">
                      {REGION_OPTIONS.map((r) => {
                        const isSelected = settings.region === r.id
                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              haptic(10)
                              updateSettings({ region: r.id })
                              showToast(`Region set to ${r.label}`)
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--bg-card-border)] hover:bg-[var(--bg-page)]'
                            }`}
                          >
                            <div>
                              <p className="text-[13px] font-semibold">{r.label}</p>
                              <p
                                className={`text-[11px] ${
                                  isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'
                                }`}
                              >
                                {r.desc}
                              </p>
                            </div>
                            {isSelected && <Check size={16} className="text-white" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-16 mr-4 h-px bg-[var(--bg-card-border)]" />

          {/* ── 3. Household Size (Servings) ── */}
          <div className="transition-colors">
            <button
              onClick={() => toggleSection('servings')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-black/[0.015] active:bg-black/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                  <Users size={19} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-[var(--text-primary)] block leading-tight">
                    Household Size
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5">
                    {settings.servings} {settings.servings === 1 ? 'person' : 'people'} (default scaling)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-[var(--text-secondary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    expandedSection === 'servings' ? 'rotate-90 text-[var(--accent)]' : ''
                  }`}
                />
              </div>
            </button>

            <div
              className={`accordion-grid ${expandedSection === 'servings' ? 'is-open' : ''}`}
            >
              <div className="accordion-grid-inner">
                <div className="accordion-content border-t border-[var(--bg-card-border)] bg-[var(--bg-page)]/40">
                  <div className="p-4 space-y-4">
                    <p className="text-[12px] text-[var(--text-secondary)]">
                      Recipes and ingredient quantities automatically scale to this portion size so you never have to calculate math in the kitchen.
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center justify-between bg-[var(--bg-card)] p-3.5 rounded-2xl border border-[var(--bg-card-border)]">
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--text-primary)]">Default Servings</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">Number of people dining</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (settings.servings > 1) {
                              haptic(10)
                              updateSettings({ servings: settings.servings - 1 })
                            }
                          }}
                          disabled={settings.servings <= 1}
                          className="w-8 h-8 rounded-full bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-primary)] hover:opacity-80 disabled:opacity-30 active:scale-95 transition-all"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums w-6 text-center">
                          {settings.servings}
                        </span>
                        <button
                          onClick={() => {
                            if (settings.servings < 12) {
                              haptic(10)
                              updateSettings({ servings: settings.servings + 1 })
                            }
                          }}
                          disabled={settings.servings >= 12}
                          className="w-8 h-8 rounded-full bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-primary)] hover:opacity-80 disabled:opacity-30 active:scale-95 transition-all"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Quick chips */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--text-secondary)]">Quick set:</span>
                      {[1, 2, 4, 6, 8].map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            haptic(10)
                            updateSettings({ servings: n })
                            showToast(`Set to ${n} servings`)
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            settings.servings === n
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                              : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--bg-card-border)] hover:bg-[var(--bg-page)]'
                          }`}
                        >
                          {n}p
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-16 mr-4 h-px bg-[var(--bg-card-border)]" />

          {/* ── 4. Standing Pantry ── */}
          <div className="transition-colors">
            <button
              onClick={() => toggleSection('pantry')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-black/[0.015] active:bg-black/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-sm">
                  <Package size={19} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-[var(--text-primary)] block leading-tight">
                    Standing Pantry
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5">
                    {settings.pantryStaples.length} essentials always in stock
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-[var(--text-secondary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    expandedSection === 'pantry' ? 'rotate-90 text-[var(--accent)]' : ''
                  }`}
                />
              </div>
            </button>

            <div
              className={`accordion-grid ${expandedSection === 'pantry' ? 'is-open' : ''}`}
            >
              <div className="accordion-grid-inner">
                <div className="accordion-content border-t border-[var(--bg-card-border)] bg-[var(--bg-page)]/40">
                  <div className="p-4 space-y-3.5">
                    <p className="text-[12px] text-[var(--text-secondary)]">
                      Staples you always have at home. Matching will not ding a recipe for missing these basic essentials.
                    </p>

                    {/* Active Staples Chips */}
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scroll-smooth">
                      {settings.pantryStaples.map((staple) => (
                        <button
                          key={staple}
                          onClick={() => {
                            haptic(10)
                            togglePantryStaple(staple)
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-full text-xs font-medium border border-[var(--bg-card-border)] shadow-xs transition-colors group"
                        >
                          <span>{staple}</span>
                          <X size={11} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                        </button>
                      ))}
                    </div>

                    {/* Add Custom Staple */}
                    <form onSubmit={handleAddStaple} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newStapleInput}
                        onChange={(e) => setNewStapleInput(e.target.value)}
                        placeholder="Add staple (e.g. Kasuri Methi)"
                        className="flex-1 px-3 py-2 text-xs bg-[var(--bg-page)] rounded-xl border border-[var(--bg-card-border)] text-[var(--text-primary)] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newStapleInput.trim()}
                        className="px-3.5 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-16 mr-4 h-px bg-[var(--bg-card-border)]" />

          {/* ── 5. Units (Metric vs Imperial) ── */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-sm">
                <Scale size={19} />
              </div>
              <div>
                <span className="text-[15px] font-semibold text-[var(--text-primary)] block leading-tight">
                  Measurement Units
                </span>
                <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5">
                  {settings.units === 'metric' ? 'Grams & ml (Metric)' : 'Ounces & cups (Imperial)'}
                </span>
              </div>
            </div>

            {/* Segmented control */}
            <div className="flex bg-[var(--bg-page)] p-1 rounded-xl border border-[var(--bg-card-border)]">
              <button
                onClick={() => {
                  haptic(8)
                  updateSettings({ units: 'metric' })
                  showToast('Units set to Metric')
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  settings.units === 'metric'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => {
                  haptic(8)
                  updateSettings({ units: 'imperial' })
                  showToast('Units set to Imperial')
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  settings.units === 'imperial'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Group 2: Account & Data ── */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-2">
          Account & Storage
        </p>

        <div className="bg-[var(--bg-card)] border border-[var(--bg-card-border)] rounded-[24px] overflow-hidden transition-colors">
          {/* Account */}
          <div className="transition-colors">
            <button
              onClick={() => {
                haptic(10)
                if (isAnonymous) {
                  openSignInSheet('account')
                } else {
                  toggleSection('account')
                }
              }}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-black/[0.015] active:bg-black/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-sm shrink-0">
                  <User size={19} />
                </div>
                <div className="min-w-0 pr-2">
                  <span className="text-[15px] font-semibold text-[var(--text-primary)] block leading-tight">
                    Account
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5 truncate">
                    {isAnonymous ? 'Guest — tap to save your progress' : (user?.email || 'Authenticated Chef')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAnonymous ? (
                  <span className="px-2.5 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[11px] font-bold">
                    Sign in
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      haptic(12)
                      signOut()
                      showToast('Switched to fresh guest session')
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[var(--text-secondary)] hover:text-red-500 text-[11px] font-semibold transition-colors"
                  >
                    <LogOut size={12} />
                    <span>Sign out</span>
                  </button>
                )}
                <ChevronRight
                  size={18}
                  className={`text-[var(--text-secondary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    expandedSection === 'account' ? 'rotate-90 text-[var(--accent)]' : ''
                  }`}
                />
              </div>
            </button>

            <div
              className={`accordion-grid ${expandedSection === 'account' ? 'is-open' : ''}`}
            >
              <div className="accordion-grid-inner">
                <div className="accordion-content border-t border-[var(--bg-card-border)] bg-[var(--bg-page)]/40">
                  <div className="p-4 space-y-3">
                    {isAnonymous ? (
                      <div className="space-y-3">
                        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                          You are currently using an anonymous guest profile. Sign in with a magic link or Google to backup your saved recipes, cooking history, and streaks permanently.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            haptic(10)
                            openSignInSheet('account')
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles size={14} />
                          <span>Save Progress with Magic Link</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-xs space-y-1">
                          <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Signed In As</p>
                          <p className="font-bold text-[var(--text-primary)]">{user?.email}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono truncate">User ID: {user?.id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            haptic(12)
                            signOut()
                            showToast('Switched to fresh guest session')
                          }}
                          className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 font-bold text-xs transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut size={14} />
                          <span>Sign out to Guest Profile</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-16 mr-4 h-px bg-[var(--bg-card-border)]" />

          {/* Erase / Reset Data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-red-50/30 active:bg-red-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-rose-500 to-red-400 flex items-center justify-center text-white shadow-sm">
                <Trash2 size={19} />
              </div>
              <div>
                <span className="text-[15px] font-semibold text-red-600 block leading-tight">
                  Erase & Reset Data
                </span>
                <span className="text-[12px] text-red-400/80 block mt-0.5">
                  Reset dietary preferences or clear saved recipes
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-red-300" />
          </button>
        </div>
      </div>

      {/* ── App Version Footer ── */}
      <footer className="text-center pt-2">
        <p className="text-[11px] text-[var(--text-secondary)] font-mono">
          Mise Kitchen OS · v0.1.0-alpha
        </p>
      </footer>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-xs bg-[var(--bg-card)] rounded-3xl p-5 shadow-2xl border border-[var(--bg-card-border)] text-center z-10"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-apple">
                Reset App Data?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                This will reset your diet, allergy filters, pantry staples, and saved bookmarks back to default.
              </p>

              <div className="mt-5 space-y-2">
                <button
                  onClick={async () => {
                    clearAllData()
                    if (user?.id) {
                      try {
                        const supabase = createClient()
                        await supabase.from('saved_recipes').delete().eq('user_id', user.id)
                      } catch (err) {
                        console.warn('[Erase & Reset] Supabase cleanup error:', err)
                      }
                    }
                    setShowClearConfirm(false)
                    haptic(15)
                    showToast('All data and settings reset to default')
                  }}
                  className="w-full py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:opacity-90 active:scale-98 transition-all"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full py-2.5 bg-[var(--bg-page)] text-[var(--text-primary)] rounded-xl text-xs font-semibold hover:opacity-80 active:scale-98 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 inset-x-0 mx-auto w-max z-50 flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-medium rounded-full shadow-lg border border-[var(--bg-card-border)] pointer-events-none"
          >
            <CheckCircle2 size={14} className="text-[var(--accent)]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
