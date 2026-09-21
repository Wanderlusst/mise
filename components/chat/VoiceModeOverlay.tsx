'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, X, Sparkles, Volume2, ChefHat, Play, Pause } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { ChefAvatar } from './ChefAvatar'

interface VoiceModeOverlayProps {
  isOpen: boolean
  onClose: () => void
  onVoiceCommand: (transcript: string) => void
}

export function VoiceModeOverlay({
  isOpen,
  onClose,
  onVoiceCommand,
}: VoiceModeOverlayProps) {
  const [isListening, setIsListening] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [chefVoiceReply, setChefVoiceReply] = useState(
    "Hi there! I'm listening. Tell me what's in your fridge, how tired you are, or what you crave."
  )
  const haptic = useHaptic()

  // Sample instant voice prompts for quick testing or voice input
  const quickVoicePrompts = [
    'I have eggs and bread.',
    'I am tired, need dinner in 10 mins.',
    'Can I skip yogurt in my curry?',
    "What's going bad in my fridge?",
  ]

  // Handle simulated or real speech input
  const handleTriggerVoice = (phrase: string) => {
    haptic(16)
    setLiveTranscript(phrase)
    setIsListening(false)
    setIsSpeaking(true)

    // Voice response generation
    setTimeout(() => {
      let reply = "Chef Mise here! Let's make a quick, delicious meal with what you have."
      if (phrase.includes('eggs')) {
        reply = "Nice! With eggs and bread, let's make a French Savory Custard Toast. In a hot pan with butter, 6 minutes total!"
      } else if (phrase.includes('tired') || phrase.includes('10')) {
        reply = "I hear you. Let's do 10-Minute Egg Fried Rice with zero stress and only 1 pan to wash."
      } else if (phrase.includes('yogurt')) {
        reply = "Yes! You can easily swap yogurt for cashew paste, coconut cream, or lemon juice."
      } else if (phrase.includes('fridge') || phrase.includes('bad')) {
        reply = "Your ripe tomatoes need using in the next 2 days! Let's make Burst Tomato Garlic Fusilli."
      }

      setChefVoiceReply(reply)

      // Try browser TTS speech synthesis if available
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(reply)
        utterance.rate = 1.05
        utterance.pitch = 1.0
        utterance.onend = () => {
          setIsSpeaking(false)
          setIsListening(true)
        }
        window.speechSynthesis.speak(utterance)
      } else {
        setTimeout(() => {
          setIsSpeaking(false)
          setIsListening(true)
        }, 3500)
      }

      // Also forward command to main chat thread
      onVoiceCommand(phrase)
    }, 900)
  }

  // Stop speech synthesis on unmount or close
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-stone-950/90 dark:bg-black/95 backdrop-blur-2xl text-white select-none overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="w-full max-w-mobile flex items-center justify-between pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-tight text-stone-100">
              Chef Mise Live Voice
            </span>
          </div>

          <button
            onClick={() => {
              haptic(10)
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
              }
              onClose()
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white/80 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Center: Apple Intelligence / Siri Style Dynamic Glowing Orb */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          {/* Outer pulsating color aura rings */}
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.45, 1.15, 1.45, 1] : isListening ? [1, 1.25, 1] : [1, 1.05, 1],
              opacity: isSpeaking ? [0.6, 0.9, 0.7, 0.9, 0.6] : [0.4, 0.7, 0.4],
              rotate: [0, 180, 360],
            }}
            transition={{
              repeat: Infinity,
              duration: isSpeaking ? 3.5 : 5,
              ease: 'easeInOut',
            }}
            className="absolute w-64 h-64 rounded-full bg-[var(--accent)]/40 blur-3xl pointer-events-none"
          />

          <motion.div
            animate={{
              scale: isSpeaking ? [1.1, 1.35, 1.1] : [1, 1.15, 1],
              rotate: [360, 180, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: 'linear',
            }}
            className="absolute w-52 h-52 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-[var(--bg-banner)]/30 blur-2xl pointer-events-none"
          />

          {/* Central Orb with fluid inner mesh */}
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.12, 0.98, 1.12, 1] : [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: 'easeInOut',
            }}
            className="relative w-36 h-36 rounded-full bg-[var(--accent)] p-1 shadow-[0_0_60px_rgba(217,113,60,0.5)] flex items-center justify-center overflow-hidden border-2 border-white/40"
          >
            {/* Animated fluid swirl */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 mix-blend-overlay animate-spin duration-700" />

            <div className="relative z-10 flex flex-col items-center justify-center text-stone-950 font-bold">
              <ChefHat size={38} className="text-white drop-shadow-md" />
              <span className="text-[10.5px] text-white/90 font-semibold tracking-wider uppercase mt-1">
                {isSpeaking ? 'Speaking' : 'Listening'}
              </span>
            </div>
          </motion.div>

          {/* Waveform Audio Bars */}
          <div className="flex items-center gap-1.5 mt-8 h-8">
            {[40, 75, 100, 60, 90, 45, 80, 50, 70].map((height, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isSpeaking
                    ? [`${height * 0.3}%`, `${height}%`, `${height * 0.2}%`]
                    : isListening
                    ? [`${Math.max(20, height * 0.4)}%`, `${height * 0.7}%`, `${height * 0.2}%`]
                    : '15%',
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.7 + (i % 4) * 0.15,
                  ease: 'easeInOut',
                }}
                className="w-1.5 rounded-full bg-[var(--accent)]"
              />
            ))}
          </div>

          {/* Live Transcript / Speech Display */}
          <div className="mt-6 px-4 text-center max-w-sm">
            <AnimatePresence mode="wait">
              {liveTranscript ? (
                <motion.p
                  key="user-input"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-semibold text-white/90 leading-relaxed mb-2"
                >
                  "{liveTranscript}"
                </motion.p>
              ) : null}
            </AnimatePresence>

            <motion.p
              key={chefVoiceReply}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13px] text-stone-300 font-medium leading-relaxed"
            >
              {chefVoiceReply}
            </motion.p>
          </div>
        </div>

        {/* Bottom Quick Voice Starters & Controls */}
        <div className="w-full max-w-mobile space-y-4 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider text-center">
              Tap to say instantly:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {quickVoicePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTriggerVoice(prompt)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[11.5px] text-stone-200 font-medium border border-white/10 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                haptic(12)
                setIsListening(!isListening)
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg ${
                isListening
                  ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/30'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {isListening ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
