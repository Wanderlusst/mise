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
} from 'lucide-react'
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
const DIET_OPTIONS: { id: DietType; label: string; icon: string; desc: string }[] = [
  { id: 'all',     label: 'All Diets',  icon: '🍽️', desc: 'No restrictions' },
  { id: 'veg',     label: 'Vegetarian', icon: '🌱', desc: 'Plant-based & dairy, no meat' },
  { id: 'non-veg', label: 'Non-Veg',    icon: '🍗', desc: 'Includes chicken, fish & eggs' },
  { id: 'vegan',   label: 'Vegan',      icon: '🌿', desc: 'Strictly 100% plant-based' },
  { id: 'jain',    label: 'Jain',       icon: '✨', desc: 'No root vegetables, onion, garlic' },
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
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-apple transition-colors">
          Settings
        </h1>
      </header>

      {/* ── Section Group 0: Appearance & Dark Mode ── */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider px-2 mb-2">
          Appearance
        </p>

        <div className="bg-white/95 dark:bg-[#2c2c2c] backdrop-blur-xl border border-black/[0.07] dark:border-white/10 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#ffa371] to-amber-500 flex items-center justify-center text-[#2c2c2c] shadow-sm">
                {settings.theme === 'dark' ? <Moon size={20} className="text-[#2c2c2c]" /> : <Sun size={20} className="text-[#2c2c2c]" />}
              </div>
              <div>
                <span className="text-[15px] font-semibold text-stone-900 dark:text-white block leading-tight">
                  Dark Mode
                </span>
                <span className="text-[12px] text-stone-500 dark:text-stone-400 block mt-0.5">
                  {settings.theme === 'dark' ? 'Charcoal #2c2c2c with #ffa371 Peach' : 'Warm Gray #ece7e4 with White'}
                </span>
              </div>
            </div>

            {/* iOS-style toggle switch */}
            <button
              onClick={() => {
                haptic(10)
                toggleTheme()
              }}
              aria-label="Toggle Dark Mode"
              className={`w-14 h-8 p-1 rounded-full transition-colors duration-200 flex items-center ${
                settings.theme === 'dark' ? 'bg-[#ffa371]' : 'bg-stone-300'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`w-6 h-6 rounded-full shadow-md ${
                  settings.theme === 'dark' ? 'bg-[#2c2c2c] ml-auto' : 'bg-white mr-auto'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Section Group 1: Culinary Preferences ── */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-stone-600/70 dark:text-stone-400 uppercase tracking-wider px-2 mb-2">
          Cooking & Matching Rules
        </p>

        <div className="bg-white/95 dark:bg-[#2c2c2c] backdrop-blur-xl border border-black/[0.07] dark:border-white/10 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-colors">
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
                  <span className="text-[15px] font-semibold text-stone-900 block leading-tight">
                    Diet & Restrictions
                  </span>
                  <span className="text-[12px] text-stone-500 block mt-0.5">
                    {currentDietObj.label}
                    {allergyCount > 0 && ` · ${allergyCount} allergy flags`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-stone-300 transition-transform duration-200 ${
                    expandedSection === 'diet' ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'diet' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden bg-stone-100/40 border-t border-black/[0.05]"
                >
                  <div className="p-4 space-y-4">
                    {/* Diet Selector */}
                    <div>
                      <p className="text-[12px] font-semibold text-stone-700 uppercase tracking-wide mb-2">
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
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm font-medium'
                                  : 'bg-white text-stone-800 border-black/[0.08] hover:bg-stone-100'
                              }`}
                            >
                              <span className="text-base">{opt.icon}</span>
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold leading-tight truncate">
                                  {opt.label}
                                </p>
                                <p
                                  className={`text-[10px] truncate ${
                                    isSelected ? 'text-stone-200' : 'text-stone-500'
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
                        <p className="text-[12px] font-semibold text-stone-700 uppercase tracking-wide">
                          Allergy Flags (Auto-Filter)
                        </p>
                        <span className="text-[11px] text-stone-500">
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
                                  ? 'bg-red-50 text-red-700 border border-red-300 shadow-xs'
                                  : 'bg-white text-stone-700 border border-black/[0.08] hover:bg-stone-100'
                              }`}
                            >
                              <span>{allergy.icon}</span>
                              <span>{allergy.label}</span>
                              {isActive && <Check size={12} className="text-red-600" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11.5px] text-stone-600 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/50">
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                      <span>
                        These filters are active across all match engines, searches, and recipe recommendations.
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-16 mr-4 h-px bg-black/[0.06]" />

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
                  <span className="text-[15px] font-semibold text-stone-900 block leading-tight">
                    Region Preference
                  </span>
                  <span className="text-[12px] text-stone-500 block mt-0.5">
                    {settings.region === 'all'
                      ? 'Pan-Indian / Any'
                      : `${settings.region} Cuisine`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-stone-300 transition-transform duration-200 ${
                    expandedSection === 'region' ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'region' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden bg-stone-100/40 border-t border-black/[0.05]"
                >
                  <div className="p-4 space-y-2.5">
                    <p className="text-[12px] text-stone-600 mb-2">
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
                                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                                : 'bg-white text-stone-800 border-black/[0.08] hover:bg-stone-100'
                            }`}
                          >
                            <div>
                              <p className="text-[13px] font-semibold">{r.label}</p>
                              <p
                                className={`text-[11px] ${
                                  isSelected ? 'text-stone-200' : 'text-stone-500'
                                }`}
                              >
                                {r.desc}
                              </p>
                            </div>
                            {isSelected && <Check size={16} className="text-saffron-400" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-16 mr-4 h-px bg-black/[0.06]" />

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
                  <span className="text-[15px] font-semibold text-stone-900 block leading-tight">
                    Household Size
                  </span>
                  <span className="text-[12px] text-stone-500 block mt-0.5">
                    {settings.servings} {settings.servings === 1 ? 'person' : 'people'} (default scaling)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-stone-300 transition-transform duration-200 ${
                    expandedSection === 'servings' ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'servings' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden bg-stone-100/40 border-t border-black/[0.05]"
                >
                  <div className="p-4 space-y-4">
                    <p className="text-[12px] text-stone-600">
                      Recipes and ingredient quantities automatically scale to this portion size so you never have to calculate math in the kitchen.
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-black/[0.08]">
                      <div>
                        <p className="text-[14px] font-semibold text-stone-900">Default Servings</p>
                        <p className="text-[11px] text-stone-500">Number of people dining</p>
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
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 disabled:opacity-30 active:scale-95 transition-all"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="text-lg font-bold text-stone-900 tabular-nums w-6 text-center">
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
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 disabled:opacity-30 active:scale-95 transition-all"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Quick chips */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500">Quick set:</span>
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
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white text-stone-700 border-black/[0.08] hover:bg-stone-100'
                          }`}
                        >
                          {n}p
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-16 mr-4 h-px bg-black/[0.06]" />

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
                  <span className="text-[15px] font-semibold text-stone-900 block leading-tight">
                    Standing Pantry
                  </span>
                  <span className="text-[12px] text-stone-500 block mt-0.5">
                    {settings.pantryStaples.length} essentials always in stock
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={18}
                  className={`text-stone-300 transition-transform duration-200 ${
                    expandedSection === 'pantry' ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'pantry' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden bg-stone-100/40 border-t border-black/[0.05]"
                >
                  <div className="p-4 space-y-3.5">
                    <p className="text-[12px] text-stone-600">
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
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-stone-800 rounded-full text-xs font-medium border border-black/[0.09] shadow-2xs hover:border-red-300 hover:text-red-700 transition-colors group"
                        >
                          <span>{staple}</span>
                          <span className="text-[10px] text-stone-400 group-hover:text-red-500">✕</span>
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
                        className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-black/[0.1] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-700/40"
                      />
                      <button
                        type="submit"
                        disabled={!newStapleInput.trim()}
                        className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-950 disabled:opacity-40 transition-opacity"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-16 mr-4 h-px bg-black/[0.06]" />

          {/* ── 5. Units (Metric vs Imperial) ── */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-sm">
                <Scale size={19} />
              </div>
              <div>
                <span className="text-[15px] font-semibold text-stone-900 block leading-tight">
                  Measurement Units
                </span>
                <span className="text-[12px] text-stone-500 block mt-0.5">
                  {settings.units === 'metric' ? 'Grams & ml (Metric)' : 'Ounces & cups (Imperial)'}
                </span>
              </div>
            </div>

            {/* Segmented control */}
            <div className="flex bg-stone-100/80 p-1 rounded-xl border border-black/[0.05]">
              <button
                onClick={() => {
                  haptic(8)
                  updateSettings({ units: 'metric' })
                  showToast('Units set to Metric')
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  settings.units === 'metric'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
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
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
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
        <p className="text-[12px] font-semibold text-stone-600/70 dark:text-stone-400 uppercase tracking-wider px-2 mb-2">
          Account & Storage
        </p>

        <div className="bg-white/95 dark:bg-[#2c2c2c] backdrop-blur-xl border border-black/[0.07] dark:border-white/10 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-colors">
          {/* Account */}
          <div className="transition-colors">
            <button
              onClick={() => toggleSection('account')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-black/[0.015] active:bg-black/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-sm">
                  <User size={19} />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-stone-900 block leading-tight">
                    Account
                  </span>
                  <span className="text-[12px] text-stone-500 block mt-0.5">
                    {settings.account.email || 'Guest Profile (Stored Locally)'}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={18}
                className={`text-stone-300 transition-transform duration-200 ${
                  expandedSection === 'account' ? 'rotate-90' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'account' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden bg-stone-100/40 border-t border-black/[0.05]"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-[12px] text-stone-600">
                      Currently using on-device guest storage. Cloud auth will allow syncing across multiple devices.
                    </p>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wide">
                        Chef Name / Email
                      </label>
                      <input
                        type="text"
                        defaultValue={settings.account.email || ''}
                        placeholder="Enter email for future sign-in"
                        onBlur={(e) => {
                          const val = e.target.value.trim()
                          updateSettings({
                            account: { ...settings.account, email: val || null },
                          })
                          if (val) showToast('Email preference saved')
                        }}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-black/[0.1] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-700/40"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-16 mr-4 h-px bg-black/[0.06]" />

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
        <p className="text-[11px] text-stone-400 font-mono">
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-black/[0.08] text-center z-10"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-apple">
                Reset App Data?
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                This will reset your diet, allergy filters, pantry staples, and saved bookmarks back to default.
              </p>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => {
                    clearAllData()
                    setShowClearConfirm(false)
                    haptic(15)
                    showToast('All settings reset to default')
                  }}
                  className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 active:scale-98 transition-all"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full py-2.5 bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-200 active:scale-98 transition-all"
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
            className="fixed bottom-24 inset-x-0 mx-auto w-max z-50 flex items-center gap-2 px-4 py-2 bg-stone-950/90 backdrop-blur-md text-white text-xs font-medium rounded-full shadow-lg border border-white/10 pointer-events-none"
          >
            <CheckCircle2 size={14} className="text-saffron-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
