'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Check, Image as ImageIcon, ChefHat } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'

interface MultiModalSheetProps {
  isOpen: boolean
  onClose: () => void
  onSendImageQuery: (imageUrl: string, question: string) => void
}

const SAMPLE_PHOTO_PRESETS = [
  {
    id: 'fridge',
    title: 'My Fridge Drawer',
    desc: 'Eggs, spinach, tomatoes, garlic',
    image: '/food/salad.jpg',
    defaultQuestion: 'Can I make anything quick with these ingredients?',
  },
  {
    id: 'pantry',
    title: 'Pantry Shelf',
    desc: 'Rice, oil, spices, onion',
    image: '/food/bowl.jpg',
    defaultQuestion: 'What budget dinner can I cook with this pantry?',
  },
  {
    id: 'recipe_shot',
    title: 'Recipe Screenshot',
    desc: 'Pasta with garlic and chili',
    image: '/food/pasta.jpg',
    defaultQuestion: 'What recipe is this and can I make it in 15 minutes?',
  },
  {
    id: 'dessert_scan',
    title: 'Dairy & Fruit Shelf',
    desc: 'Yogurt, honey, berries',
    image: '/food/yogurt.jpg',
    defaultQuestion: 'Can I make a healthy sweet dessert with this?',
  },
]

export function MultiModalSheet({
  isOpen,
  onClose,
  onSendImageQuery,
}: MultiModalSheetProps) {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_PHOTO_PRESETS[0])
  const [customQuestion, setCustomQuestion] = useState(
    'Can I make anything quick with these ingredients?'
  )
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null)
  const haptic = useHaptic()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCustomImagePreview(url)
    }
  }

  const handleSend = () => {
    haptic(14)
    const imgUrl = customImagePreview || selectedPreset.image
    onSendImageQuery(imgUrl, customQuestion)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="w-full max-w-mobile rounded-t-[32px] sm:rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xs p-5 space-y-4 max-h-[88vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--bg-card-border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                <Camera size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Multi-Modal Kitchen Scanner
                </h3>
                <span className="text-[10.5px] text-[var(--text-secondary)] font-medium">
                  Chef Mise Vision Assistant
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                haptic(8)
                onClose()
              }}
              className="w-8 h-8 rounded-full bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-secondary)]"
            >
              <X size={15} />
            </button>
          </div>

          {/* Preset Photo Selection */}
          <div>
            <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-2">
              Select or Upload Photo
            </span>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    haptic(8)
                    setSelectedPreset(preset)
                    setCustomImagePreview(null)
                    setCustomQuestion(preset.defaultQuestion)
                  }}
                  className={`relative p-2 rounded-2xl border text-left flex flex-col gap-1.5 transition-all overflow-hidden ${
                    !customImagePreview && selectedPreset.id === preset.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30'
                      : 'border-[var(--bg-card-border)] bg-[var(--bg-page)]'
                  }`}
                >
                  <div className="relative h-20 w-full rounded-xl overflow-hidden">
                    <Image
                      src={preset.image}
                      alt={preset.title}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-stone-900 dark:text-white truncate">
                    {preset.title}
                  </span>
                  <span className="text-[9.5px] text-stone-500 dark:text-stone-400 truncate">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Real File Upload Option */}
            <label className="mt-2.5 flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-dashed border-[var(--bg-card-border)] bg-[var(--bg-page)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors text-[11.5px] font-semibold text-[var(--text-primary)]">
              <Upload size={14} className="text-[var(--accent)]" />
              <span>Or upload your own fridge / pantry photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Question / Prompt Input */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Ask Chef Mise about this photo
            </span>
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. Can I make anything with this?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            />
          </div>

          {/* Quick preset questions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'Can I make anything with this?',
              'Is this onion still good?',
              'What recipe is this?',
              'Substitute suggestions?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCustomQuestion(q)}
                className="px-2.5 py-1 rounded-full bg-stone-100/90 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10.5px] font-medium border border-black/[0.04] dark:border-white/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              onClick={handleSend}
              className="w-full py-3 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-white text-[12.5px] font-bold shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ChefHat size={15} />
              <span>Analyze with Chef Mise Vision</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
