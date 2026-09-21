'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TIME_OPTIONS, CookingTimeFilter } from '@/lib/homeData'
import { useHaptic } from '@/lib/useHaptic'
import { Clock, Sliders, X, Check, Zap, Timer, CookingPot, Soup, SlidersHorizontal } from 'lucide-react'

function renderTimeIcon(icon: string, isSelected: boolean) {
  const props = { size: 18, strokeWidth: 2.2 }
  switch (icon) {
    case 'zap':
      return <Zap {...props} className={isSelected ? 'text-white' : 'text-amber-500'} />
    case 'timer':
      return <Timer {...props} className={isSelected ? 'text-white' : 'text-orange-500'} />
    case 'cooking-pot':
      return <CookingPot {...props} className={isSelected ? 'text-white' : 'text-[var(--accent)]'} />
    case 'soup':
      return <Soup {...props} className={isSelected ? 'text-white' : 'text-red-500'} />
    case 'sliders':
      return <SlidersHorizontal {...props} className={isSelected ? 'text-white' : 'text-purple-500'} />
    default:
      return <Clock {...props} />
  }
}

interface TimePreferenceSelectorProps {
  selectedTime: CookingTimeFilter
  customMinutes: number
  onSelectTime: (time: CookingTimeFilter) => void
  onChangeCustomMinutes: (minutes: number) => void
}

export function TimePreferenceSelector({
  selectedTime,
  customMinutes,
  onSelectTime,
  onChangeCustomMinutes,
}: TimePreferenceSelectorProps) {
  const haptic = useHaptic()
  const [customDrawerOpen, setCustomDrawerOpen] = useState(false)
  const [tempMinutes, setTempMinutes] = useState(customMinutes)

  const handleSelectTime = (timeId: CookingTimeFilter) => {
    haptic(12)
    onSelectTime(timeId)
    if (timeId === 'custom') {
      setTempMinutes(customMinutes)
      setCustomDrawerOpen(true)
    }
  }

  const handleApplyCustom = () => {
    haptic(14)
    onChangeCustomMinutes(tempMinutes)
    setCustomDrawerOpen(false)
  }

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-[var(--accent)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            How Much Time Do You Have?
          </h2>
        </div>

        {selectedTime === 'custom' && (
          <button
            type="button"
            onClick={() => {
              haptic(8)
              setTempMinutes(customMinutes)
              setCustomDrawerOpen(true)
            }}
            className="text-xs font-semibold text-[var(--accent-text-on-light)] flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Sliders size={12} />
            <span>Edit ({customMinutes}m)</span>
          </button>
        )}
      </div>

      {/* Horizontally scrollable container with large pill buttons */}
      <div className="relative -mx-5 px-5">
        <div
          role="radiogroup"
          aria-label="Cooking time preference"
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1.5 scroll-px-5 snap-x"
        >
          {TIME_OPTIONS.map((opt) => {
            const isSelected = selectedTime === opt.id

            return (
              <motion.button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectTime(opt.id)}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-2xl min-w-[124px] h-[58px] transition-all shrink-0 snap-start select-none outline-none group text-left ${
                  isSelected
                    ? 'text-white shadow-md'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--bg-card-border)] hover:border-stone-300 dark:hover:border-stone-700 shadow-2xs'
                }`}
              >
                {/* Framer Motion Shared Layout Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="activeTimeIndicator"
                    className="absolute inset-0 rounded-2xl bg-[var(--accent)] shadow-[0_6px_20px_rgba(235,94,40,0.28)] dark:shadow-[0_6px_20px_rgba(235,94,40,0.4)] -z-0"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}

                {/* Left Icon with subtle bounce */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-white/20 text-white backdrop-blur-xs'
                      : 'bg-[var(--bg-page)] border border-[var(--bg-card-border)]'
                  }`}
                >
                  {renderTimeIcon(opt.icon, isSelected)}
                </div>

                {/* Right Text details */}
                <div className="relative z-10 flex flex-col justify-center min-w-0">
                  <span className="text-xs font-apple font-bold tracking-tight leading-tight truncate">
                    {opt.id === 'custom' && selectedTime === 'custom'
                      ? `${customMinutes} min`
                      : opt.label}
                  </span>
                  <span
                    className={`text-[10px] font-medium tracking-tight leading-tight truncate mt-0.5 ${
                      isSelected ? 'text-white/85' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {opt.id === 'custom' && selectedTime === 'custom'
                      ? 'Custom set'
                      : opt.sublabel}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Interactive Custom Time Modal / Drawer */}
      <AnimatePresence>
        {customDrawerOpen && (
          <motion.div
            key="custom-time-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-stone-950/70 backdrop-blur-sm"
            onClick={() => setCustomDrawerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[var(--bg-card)] rounded-[32px] p-6 border border-[var(--bg-card-border)] shadow-2xl relative space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-apple font-bold text-[var(--text-primary)]">
                    Exact Cooking Time
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Find recipes that fit your exact schedule
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Big Digital Readout */}
              <div className="p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-center space-y-1">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl font-bold font-apple text-[var(--accent)] tabular-nums">
                    {tempMinutes}
                  </span>
                  <span className="text-base font-semibold text-[var(--text-secondary)]">
                    minutes
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium">
                  {tempMinutes <= 15 ? (
                    <>
                      <Zap size={12} className="text-amber-500" />
                      <span>Fast express cooking</span>
                    </>
                  ) : tempMinutes <= 35 ? (
                    <>
                      <CookingPot size={12} className="text-[var(--accent)]" />
                      <span>Standard weeknight dinner</span>
                    </>
                  ) : (
                    <>
                      <Soup size={12} className="text-red-500" />
                      <span>Deep simmer & relaxed preparation</span>
                    </>
                  )}
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={tempMinutes}
                  onChange={(e) => {
                    haptic(6)
                    setTempMinutes(Number(e.target.value))
                  }}
                  className="w-full h-2.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)]">
                  <span>5 min</span>
                  <span>30 min</span>
                  <span>60 min</span>
                  <span>120 min</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Quick Presets
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 45, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        haptic(8)
                        setTempMinutes(m)
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        tempMinutes === m
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'bg-[var(--bg-page)] text-[var(--text-primary)] border-[var(--bg-card-border)] hover:border-stone-300'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full py-3.5 px-6 rounded-full bg-[var(--accent)] text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Apply {tempMinutes} Min Limit</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
