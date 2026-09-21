'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Camera, Send, ArrowUp, Zap, HelpCircle } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'

interface ChatCommandBarProps {
  inputValue: string
  onInputChange: (val: string) => void
  onSend: (text?: string) => void
  onOpenVoice: () => void
  onOpenMultiModal: () => void
  onOpenShortcuts?: () => void
  isTyping?: boolean
  disabled?: boolean
}

const ROTATING_PLACEHOLDERS = [
  'Ask Chef Mise anything...',
  'What can I cook with eggs and rice?',
  'Can I skip or substitute yogurt?',
  'Use my scanned ingredients...',
  "What's going bad in my fridge?",
  'I am tired, need dinner in 10 minutes...',
]

export function ChatCommandBar({
  inputValue,
  onInputChange,
  onSend,
  onOpenVoice,
  onOpenMultiModal,
  onOpenShortcuts,
  isTyping = false,
  disabled = false,
}: ChatCommandBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const haptic = useHaptic()

  // Cycle through inspirational placeholders smoothly
  useEffect(() => {
    if (inputValue.trim()) return
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length)
    }, 4200)
    return () => clearInterval(interval)
  }, [inputValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping || disabled) return
    onSend()
  }

  return (
    <div
      className="fixed inset-x-0 z-40 flex justify-center pointer-events-none px-4"
      style={{
        bottom: 'calc(5.85rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="pointer-events-auto relative w-full max-w-[390px] rounded-[26px] bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--bg-card-border)] shadow-[0_4px_24px_rgba(0,0,0,0.09)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] p-1.5 transition-all">
        {/* Subtle iridescent perimeter line */}
        <div className="absolute inset-0 rounded-[26px] p-[1px] bg-[var(--accent)]/20 -z-10 pointer-events-none" />

        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          {/* Action 1: Multi-modal camera scan button */}
          <button
            type="button"
            onClick={() => {
              haptic(10)
              onOpenMultiModal()
            }}
            aria-label="Scan or upload ingredients"
            className="w-9 h-9 rounded-2xl bg-[var(--bg-page)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] flex items-center justify-center shrink-0 active:scale-90 transition-all border border-[var(--bg-card-border)]"
          >
            <Camera size={16} />
          </button>

          {/* Action 2: Voice Mode trigger with warm pulsing glow */}
          <button
            type="button"
            onClick={() => {
              haptic(14)
              onOpenVoice()
            }}
            aria-label="Voice conversation mode"
            className="relative w-9 h-9 rounded-2xl bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent-text-on-light)] flex items-center justify-center shrink-0 active:scale-90 transition-all border border-[var(--accent)]/20"
          >
            <motion.span
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="absolute inset-0 rounded-2xl bg-[var(--accent)]/20 blur-xs -z-10"
            />
            <Mic size={16} />
          </button>

          {/* Text Input Container */}
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={disabled}
              placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
              className="w-full px-3 py-2 text-[12.5px] bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-colors"
            />
          </div>

          {/* Action 3: Send message */}
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isTyping || disabled}
            whileTap={{ scale: 0.92 }}
            aria-label="Send message"
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-xs ${
              inputValue.trim() && !isTyping
                ? 'bg-[var(--accent)] text-white hover:opacity-90'
                : 'bg-[var(--bg-page)] text-[var(--text-secondary)] opacity-40 cursor-not-allowed border border-[var(--bg-card-border)]'
            }`}
          >
            <ArrowUp size={16} strokeWidth={2.4} />
          </motion.button>
        </form>
      </div>
    </div>
  )
}
