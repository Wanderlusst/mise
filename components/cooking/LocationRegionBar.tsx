'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, Crosshair, Check } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { IndianRegion } from '@/lib/recipeTypes'
import { detectRegionFromCoords } from '@/lib/useSettings'

interface LocationRegionBarProps {
  selectedRegion: IndianRegion
  onSelectRegion: (region: IndianRegion) => void
  cityLabel?: string
}

const REGION_LIST: { id: IndianRegion; name: string; state: string; icon: string; specialties: string }[] = [
  { id: 'All', name: 'All of India', state: 'Pan-Indian', icon: '🇮🇳', specialties: 'Diverse regional dishes' },
  { id: 'Kerala', name: 'Kochi / Malabar', state: 'Kerala', icon: '🌴', specialties: 'Egg Roast, Thoran, Stew, Coconut' },
  { id: 'Tamil Nadu', name: 'Chennai / Madurai', state: 'Tamil Nadu', icon: '🛕', specialties: 'Lemon Sevai, Kara Kuzhambu, Tomato Rice' },
  { id: 'Maharashtra', name: 'Mumbai / Pune', state: 'Maharashtra', icon: '🌊', specialties: 'Kanda Poha, Misal Pav, Pitla' },
  { id: 'Karnataka', name: 'Bengaluru / Mysore', state: 'Karnataka', icon: '🌾', specialties: 'Curd Rice, Bisi Bele Bath' },
  { id: 'North Indian', name: 'Delhi / Amritsar', state: 'North Indian', icon: '🍲', specialties: 'Paneer Bhurji, Dal Makhani' },
]

export function LocationRegionBar({
  selectedRegion,
  onSelectRegion,
  cityLabel,
}: LocationRegionBarProps) {
  const haptic = useHaptic()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeItem = REGION_LIST.find((r) => r.id === selectedRegion) || REGION_LIST[1]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleDetectLocation = (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic(10)
    setIsDetecting(true)
    setLocationMessage('Detecting GPS…')

    if (!navigator.geolocation) {
      setIsDetecting(false)
      setLocationMessage('Location not available')
      setTimeout(() => setLocationMessage(null), 2500)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = detectRegionFromCoords(pos.coords.latitude, pos.coords.longitude)
        setIsDetecting(false)
        setLocationMessage(`Detected: ${detected}`)
        onSelectRegion(detected as IndianRegion)
        haptic(15)
        setTimeout(() => {
          setDropdownOpen(false)
          setLocationMessage(null)
        }, 600)
      },
      () => {
        setIsDetecting(false)
        onSelectRegion('Kerala')
        setLocationMessage('Set to Kerala')
        setTimeout(() => {
          setDropdownOpen(false)
          setLocationMessage(null)
        }, 600)
      },
      { timeout: 7000 }
    )
  }

  const handleSelectOption = (regionId: IndianRegion) => {
    haptic(10)
    onSelectRegion(regionId)
    setDropdownOpen(false)
  }

  return (
    <section className="space-y-3">
      {/* ── Top Row with Dropdown Pill ── */}
      <div className="flex items-center justify-between">
        {/* Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              haptic(8)
              setDropdownOpen((prev) => !prev)
            }}
            id="location-region-selector-btn"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all shadow-xs text-left cursor-pointer border ${
              dropdownOpen
                ? 'bg-[var(--bg-card)] border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                : 'bg-[var(--bg-card)] border-[var(--bg-card-border)] hover:border-[var(--accent)]/50'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)] shrink-0">
              <MapPin size={14} strokeWidth={2.2} />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] leading-tight flex items-center gap-1">
                <span>Cooking Region</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              </span>
              <span className="text-xs font-apple font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span>{activeItem.icon} {activeItem.state}</span>
                <motion.span
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex text-stone-400"
                >
                  <ChevronDown size={13} strokeWidth={2.2} />
                </motion.span>
              </span>
            </div>
          </motion.button>

          {/* ── Real Anchored Dropdown Menu ── */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-2xl p-2 space-y-1.5 backdrop-blur-md"
              >
                {/* Geolocation Auto-Detect Button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/15 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Crosshair size={16} className={isDetecting ? 'animate-spin' : ''} />
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {locationMessage || (isDetecting ? 'Detecting GPS…' : 'Use Current Location')}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        Auto-detects Kerala, Tamil Nadu, etc.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    GPS
                  </span>
                </button>

                <div className="w-full h-px bg-[var(--bg-card-border)] my-1" />

                {/* Region Options List */}
                <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                  {REGION_LIST.map((item) => {
                    const isSelected = selectedRegion === item.id

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectOption(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white font-bold shadow-xs'
                            : 'hover:bg-[var(--bg-page)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0">{item.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {item.state}
                            </p>
                            <p
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'
                              }`}
                            >
                              {item.specialties}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2">
                            <Check size={12} strokeWidth={3} className="text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
          {cityLabel || 'Hyperlocal Recipes'}
        </span>
      </div>

      {/* ── 1-Tap Quick Regional Switcher Bar (Bottom Chips) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 py-0.5">
        {REGION_LIST.map((item) => {
          const isSelected = selectedRegion === item.id

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                haptic(8)
                onSelectRegion(item.id)
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[var(--accent)] text-white shadow-sm ring-2 ring-[var(--accent)]/20'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:text-[var(--text-primary)] hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.id}</span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
