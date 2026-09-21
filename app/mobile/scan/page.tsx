'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  X,
  ChefHat,
  ImagePlus,
  Camera,
  ArrowLeft,
  Zap,
  ZapOff,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'
import { useScannedPantry } from '@/lib/useSavedRecipes'

// ─── Types ─────────────────────────────────────────────────────────────────────
type CameraPermission = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'
type ScanState = 'idle' | 'capturing' | 'detecting' | 'confirmed'

// ─── Scan Brackets ─────────────────────────────────────────────────────────────
function ScanBrackets({ animate }: { animate: boolean }) {
  const reducedMotion = useReducedMotion()
  const size = 210
  const cornerLen = 32
  const stroke = 2.5
  const AMBER = 'var(--accent)'

  const corners = [
    `M ${cornerLen} 0 L 0 0 L 0 ${cornerLen}`,
    `M ${size - cornerLen} 0 L ${size} 0 L ${size} ${cornerLen}`,
    `M ${size} ${size - cornerLen} L ${size} ${size} L ${size - cornerLen} ${size}`,
    `M ${cornerLen} ${size} L 0 ${size} L 0 ${size - cornerLen}`,
  ]

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none"
      animate={
        animate && !reducedMotion
          ? { opacity: [0.65, 1, 0.65], scale: [0.99, 1.01, 0.99] }
          : { opacity: 0.5, scale: 1 }
      }
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {corners.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={AMBER}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </motion.svg>
  )
}

// ─── Laser Line ────────────────────────────────────────────────────────────────
function ScanLaserLine({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion()
  if (!active || reducedMotion) return null
  return (
    <motion.div
      className="absolute left-5 right-5 h-px rounded-full pointer-events-none"
      style={{
        background:
          'linear-gradient(90deg, transparent, var(--accent), transparent)',
        boxShadow: '0 0 10px var(--accent)',
      }}
      initial={{ top: '6%' }}
      animate={{ top: ['6%', '93%', '6%'] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ─── Ingredient Pill ───────────────────────────────────────────────────────────
function IngredientPill({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        bg-[var(--bg-card)]
        text-[var(--text-primary)]
        border border-[var(--bg-card-border)]"
    >
      {name}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center
          text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        aria-label={`Remove ${name}`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </motion.span>
  )
}

// ─── Confirmation Sheet ────────────────────────────────────────────────────────
function ConfirmationSheet({
  open,
  ingredients,
  onClose,
  onFindRecipes,
}: {
  open: boolean
  ingredients: string[]
  onClose: () => void
  onFindRecipes: (items: string[]) => void
}) {
  const [items, setItems] = useState<string[]>(ingredients)
  const [inputVal, setInputVal] = useState('')
  const [isFinding, setIsFinding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setItems(ingredients)
  }, [ingredients])

  useEffect(() => {
    if (open) {
      document.body.classList.add('hide-nav')
    } else {
      document.body.classList.remove('hide-nav')
    }
    return () => {
      document.body.classList.remove('hide-nav')
    }
  }, [open])

  const handleAdd = () => {
    const trimmed = inputVal.trim()
    if (!trimmed || items.map((i) => i.toLowerCase()).includes(trimmed.toLowerCase())) return
    setItems((prev) => [...prev, trimmed])
    setInputVal('')
  }

  const handleFind = async () => {
    setIsFinding(true)
    await onFindRecipes(items)
    setIsFinding(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[100] rounded-t-[32px] max-h-[88vh] flex flex-col
              bg-[var(--bg-card)]
              border-t border-[var(--bg-card-border)]
              shadow-[0_-16px_48px_rgba(0,0,0,0.25)] max-w-[430px] mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--bg-card-border)]">
              <div>
                <h2 className="text-[var(--text-primary)] font-bold text-base font-apple">
                  Detected Ingredients & Drinks
                </h2>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">
                  Review and edit before brewing or cooking
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer
                  bg-[var(--bg-page)]"
                aria-label="Close"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-[var(--text-secondary)] text-sm italic text-center py-4">
                  No ingredients or drinks detected. Add manually below!
                </p>
              ) : (
                <motion.div layout className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {items.map((item) => (
                      <IngredientPill
                        key={item}
                        name={item}
                        onRemove={() => setItems((p) => p.filter((i) => i !== item))}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAdd()
                    }
                  }}
                  placeholder="Add another item (e.g. 7UP, Lime, Maggi)…"
                  className="flex-1 text-sm px-3.5 py-2.5 rounded-xl
                    bg-[var(--bg-page)]
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-secondary)]
                    border border-[var(--bg-card-border)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                />
                <button
                  onClick={handleAdd}
                  disabled={!inputVal.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center
                    bg-[var(--accent)] text-white
                    disabled:opacity-40 hover:opacity-90 transition-colors shrink-0 cursor-pointer"
                  aria-label="Add ingredient"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pt-3 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] border-t border-[var(--bg-card-border)] bg-[var(--bg-card)] shrink-0">
              <motion.button
                id="brew-or-cook-btn"
                whileTap={{ scale: 0.98 }}
                onClick={handleFind}
                disabled={items.length === 0 || isFinding}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5
                  bg-[var(--accent)] hover:brightness-105 active:scale-[0.98] disabled:opacity-50 text-white
                  shadow-sm transition-all cursor-pointer font-apple"
              >
                {isFinding ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Brewing & Cooking recipes…
                  </>
                ) : (
                  <>
                    <ChefHat size={20} strokeWidth={2.2} />
                    <span>Brew or Cook ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5"
      style={{
        background: 'var(--bg-page)',
      }}
    >
      <motion.div
        className="w-14 h-14 rounded-full border-2 border-t-[var(--accent)]"
        style={{
          borderColor: 'var(--bg-card-border)',
          borderTopColor: 'var(--accent)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        Starting camera in browser…
      </p>
    </div>
  )
}

// ─── High-Tech AI Detecting Overlay ──────────────────────────────────────────
function DetectingOverlay() {
  const [stepIdx, setStepIdx] = useState(0)
  const steps = [
    'Scanning ingredients with AI Vision…',
    'Analyzing visual contours & textures…',
    'Identifying fresh produce & pantry items…',
    'Matching recipes in your kitchen…',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length)
    }, 1250)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 45%, rgba(217, 113, 60, 0.22) 0%, rgba(18, 14, 12, 0.88) 65%, rgba(8, 6, 5, 0.96) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative flex flex-col items-center text-center p-8 rounded-[36px] max-w-[340px] w-full border border-white/15 shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(28, 25, 23, 0.82)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Ambient Glow Aura */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full pointer-events-none blur-3xl opacity-50"
          style={{ background: 'var(--accent)' }}
        />

        {/* Radar Scanner Animation */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Outer Ripple Wave */}
          <motion.div
            className="absolute inset-0 rounded-full border border-[var(--accent)]"
            animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />

          {/* Secondary Ripple Wave */}
          <motion.div
            className="absolute inset-2 rounded-full border border-[var(--accent)]/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />

          {/* Spinning Dashed Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-dashed"
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          />

          {/* Fast Spinner Track */}
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-white/10 border-t-[var(--accent)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center Glowing Hub */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#B35222] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30">
            <Sparkles size={24} className="text-white animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white tracking-tight font-apple mb-1.5">
          Detecting Ingredients
        </h3>

        {/* Animated Step Subtitle with Crossfade */}
        <div className="h-9 flex items-center justify-center mb-5 px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-medium text-stone-300 leading-relaxed"
            >
              {steps[stepIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Indeterminate Shimmer Progress Bar */}
        <div className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden relative mb-4">
          <motion.div
            className="absolute top-0 bottom-0 w-20 rounded-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
            animate={{ x: [-80, 200] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Culinary Intelligence Badge */}
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent-text-on-light)] uppercase tracking-wider bg-[var(--accent)]/15 px-3 py-1 rounded-full border border-[var(--accent)]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
          <span>Mise AI Vision</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Clean Two-Options Screen (Scan or Upload only) ─────────────────────────────
function TwoOptionsScreen({
  isDark,
  permission,
  onScan,
  onGallery,
  onManualEntry,
  onBack,
}: {
  isDark: boolean
  permission: CameraPermission
  onScan: () => void
  onGallery: () => void
  onManualEntry: () => void
  onBack: () => void
}) {
  const bg = 'var(--bg-page)'
  const textPrimary = 'var(--text-primary)'
  const textMuted = 'var(--text-secondary)'
  const backBtnBg = 'var(--bg-card)'
  const backBtnBorder = 'var(--bg-card-border)'

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden select-none"
      style={{
        background: bg,
        paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
        paddingBottom: 'max(6.5rem, calc(env(safe-area-inset-bottom) + 5rem))',
      }}
    >
      {/* Top Bar with Back Button */}
      <div className="relative z-10 px-5 pt-2 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-opacity"
          style={{
            background: backBtnBg,
            border: `1px solid ${backBtnBorder}`,
            color: textPrimary,
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={19} strokeWidth={2.2} />
        </motion.button>
      </div>

      {/* Center Section: Title & Action Options */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 space-y-2"
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-1"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--accent-text-on-light)',
              border: '1px solid var(--bg-card-border)',
            }}
          >
            <Sparkles size={12} strokeWidth={2.5} />
            <span>AI Recipe Scanner</span>
          </div>

          <h1
            className="text-2xl font-bold tracking-tight font-apple"
            style={{ color: textPrimary }}
          >
            Scan Ingredients
          </h1>
          <p className="text-xs leading-relaxed max-w-[260px] mx-auto" style={{ color: textMuted }}>
            Open camera live in app, choose a photo, or enter ingredients manually.
          </p>

          {/* Camera Permission or Availability Notification */}
          {(permission === 'denied' || permission === 'unavailable') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--accent-text-on-light)] shadow-xs text-left"
            >
              <AlertCircle size={14} strokeWidth={2.2} className="shrink-0" />
              <span>
                {permission === 'denied'
                  ? 'Camera access denied. Tap "Enter Manually" below to continue!'
                  : 'No camera available. Tap "Enter Manually" below to continue!'}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Action Options (Scan, Upload, or Manual) ── */}
        <div className="space-y-3.5">
          {/* Option 1: Scan with Camera */}
          <motion.button
            id="option-scan-camera"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={onScan}
            className="w-full p-4 rounded-3xl flex items-center justify-between text-left cursor-pointer transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-card-border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  background: 'var(--accent)',
                }}
              >
                <Camera size={26} strokeWidth={2.2} className="text-white" />
              </div>

              <div>
                <h2
                  className="font-bold text-base leading-tight font-apple"
                  style={{ color: textPrimary }}
                >
                  Camera Scan
                </h2>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  Open live camera in app
                </p>
              </div>
            </div>

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'var(--bg-page)',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </div>
          </motion.button>

          {/* Option 2: Upload from Gallery */}
          <motion.button
            id="option-upload-gallery"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={onGallery}
            className="w-full p-4 rounded-3xl flex items-center justify-between text-left cursor-pointer transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-card-border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  background: 'var(--bg-page)',
                  border: '1px solid var(--bg-card-border)',
                }}
              >
                <ImagePlus
                  size={24}
                  strokeWidth={2}
                  style={{ color: textPrimary }}
                />
              </div>

              <div>
                <h2
                  className="font-bold text-base leading-tight font-apple"
                  style={{ color: textPrimary }}
                >
                  Upload from Gallery
                </h2>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  Choose from photo library
                </p>
              </div>
            </div>

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'var(--bg-page)',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </div>
          </motion.button>

          {/* Option 3: Manual Entry Fallback (Never dead-end!) */}
          <motion.button
            id="option-manual-entry"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={onManualEntry}
            className="w-full p-4 rounded-3xl flex items-center justify-between text-left cursor-pointer transition-all"
            style={{
              background: 'var(--bg-card)',
              border: (permission === 'denied' || permission === 'unavailable')
                ? '1.5px solid var(--accent)'
                : '1px solid var(--bg-card-border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  background: (permission === 'denied' || permission === 'unavailable')
                    ? 'var(--accent)'
                    : 'var(--bg-page)',
                  border: '1px solid var(--bg-card-border)',
                }}
              >
                <Plus
                  size={24}
                  strokeWidth={2.4}
                  style={{
                    color: (permission === 'denied' || permission === 'unavailable')
                      ? 'var(--text-on-banner)'
                      : textPrimary,
                  }}
                />
              </div>

              <div>
                <h2
                  className="font-bold text-base leading-tight font-apple"
                  style={{ color: textPrimary }}
                >
                  Enter Manually
                </h2>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  Type your ingredients directly
                </p>
              </div>
            </div>

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'var(--bg-page)',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Camera UI (When camera live stream is granted) ────────────────────────
function CameraUI({
  stream,
  videoRef,
  scanState,
  isDark,
  torchOn,
  onCapture,
  onGallery,
  onToggleTorch,
  onBack,
}: {
  stream: MediaStream
  videoRef: React.RefObject<HTMLVideoElement>
  scanState: ScanState
  isDark: boolean
  torchOn: boolean
  onCapture: () => void
  onGallery: () => void
  onToggleTorch: () => void
  onBack: () => void
}) {
  const isScanning = scanState === 'idle'
  const isDetecting = scanState === 'detecting' || scanState === 'capturing'

  useEffect(() => {
    const video = videoRef.current
    if (video && stream) {
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      video.muted = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Camera playback auto-play error]', err)
        })
      }
    }
  }, [stream, videoRef])

  const pillStyle = isDark
    ? {
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.14)',
      }
    : {
        background: 'rgba(255,255,255,0.35)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.5)',
      }

  const iconBtnStyle = isDark
    ? {
        background: 'rgba(0,0,0,0.42)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.14)',
      }
    : {
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.55)',
      }

  const torchActiveStyle = {
    background: 'rgba(217,164,65,0.3)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(217,164,65,0.5)',
  }

  return (
    <div className="fixed inset-0 w-screen h-screen z-40 overflow-hidden select-none bg-black">
      {/* Edge-to-edge Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Cinematic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-56 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
      />

      {/* Top Bar */}
      <div
        className="absolute inset-x-0 z-20 flex items-center justify-between px-5 pointer-events-auto"
        style={{ top: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onBack}
          id="scan-close-btn"
          aria-label="Close scanner"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer"
          style={iconBtnStyle}
        >
          <X size={18} strokeWidth={2} />
        </motion.button>

        <div className="px-4 py-1.5 rounded-full" style={pillStyle}>
          <p className="text-white text-xs font-semibold tracking-wide">Scan Ingredients</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onToggleTorch}
          id="torch-btn"
          aria-label={torchOn ? 'Flash off' : 'Flash on'}
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
          style={torchOn ? torchActiveStyle : iconBtnStyle}
        >
          {torchOn ? (
            <Zap size={17} strokeWidth={2} style={{ color: 'var(--accent)' }} />
          ) : (
            <ZapOff size={17} strokeWidth={2} className="text-white" />
          )}
        </motion.button>
      </div>

      {/* Center Scan Brackets + Laser */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative w-[210px] h-[210px]">
          <ScanBrackets animate={isScanning} />
          <ScanLaserLine active={isScanning} />
        </div>
      </div>

      {/* Hint below brackets */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 z-20 flex justify-center pointer-events-none"
            style={{ top: 'calc(50% + 124px)' }}
          >
            <div className="px-4 py-1.5 rounded-full" style={pillStyle}>
              <p className="text-white/80 text-xs font-medium">Point at your ingredients</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detecting Overlay */}
      <AnimatePresence>
        {isDetecting && <DetectingOverlay />}
      </AnimatePresence>

      {/* Bottom Controls: Gallery & Shutter ONLY */}
      <div
        className="absolute inset-x-0 z-20 flex items-center justify-center gap-14 px-6 pointer-events-auto"
        style={{ bottom: 'max(2.5rem, calc(env(safe-area-inset-bottom) + 1.75rem))' }}
      >
        {/* Gallery Button */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onGallery}
            id="gallery-btn"
            aria-label="Upload from gallery"
            className="w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer"
            style={iconBtnStyle}
          >
            <ImagePlus size={22} strokeWidth={2} />
          </motion.button>
          <span className="text-[10px] font-medium text-white/60 tracking-wide">Gallery</span>
        </div>

        {/* Shutter Button (Capture from live camera feed) */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            id="shutter-btn"
            aria-label="Capture"
            disabled={scanState !== 'idle'}
            whileTap={{ scale: 0.92 }}
            onClick={onCapture}
            className="relative w-[78px] h-[78px] rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50"
            style={{
              border: '3.5px solid rgba(255,255,255,0.9)',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            <div className="w-[62px] h-[62px] rounded-full bg-white" />
          </motion.button>
          <span className="text-[10px] font-medium text-white/60 tracking-wide">Scan</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Scan Page ─────────────────────────────────────────────────────────────
export default function ScanPage() {
  const [permission, setPermission] = useState<CameraPermission>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const haptic = useHaptic()
  const router = useRouter()
  const { settings } = useSettings()
  const { addPantryItems } = useScannedPantry()
  const isDark = settings.theme === 'dark'

  const handleManualEntry = useCallback(() => {
    haptic(10)
    setDetectedIngredients([])
    setScanState('confirmed')
    setSheetOpen(true)
  }, [haptic])

  // ── Stop stream on unmount ──
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  // ── Toggle Torch ──
  const toggleTorch = useCallback(async () => {
    const track = stream?.getVideoTracks()[0]
    if (!track) return
    try {
      const caps = track.getCapabilities?.() as { torch?: boolean }
      if (!caps?.torch) return
      const next = !torchOn
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      setTorchOn(next)
      haptic(8)
    } catch {
      /* torch unsupported */
    }
  }, [stream, torchOn, haptic])

  // ── Handle image file (from gallery) ──
  const handleImageFile = useCallback(
    async (file: File) => {
      haptic(15)
      setScanState('capturing')
      await new Promise((r) => setTimeout(r, 100))
      setScanState('detecting')
      try {
        const form = new FormData()
        form.append('image', file, file.name || 'capture.jpg')
        const res = await fetch('/api/detect-ingredients', { method: 'POST', body: form })
        const data = await res.json()
        setDetectedIngredients(data.ingredients ?? [])
      } catch {
        setDetectedIngredients([])
      }
      setScanState('confirmed')
      setSheetOpen(true)
    },
    [haptic]
  )

  // ── Scan Button Handler (Directly opens live in-app/in-browser camera) ──
  const handleScanOption = useCallback(async () => {
    haptic(10)
    setPermission('requesting')

    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn('[Camera] getUserMedia not available in this browser')
      setPermission('unavailable')
      return
    }

    const constraintsList: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: true, audio: false },
    ]

    let mediaStream: MediaStream | null = null
    for (const constraints of constraintsList) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        if (mediaStream) break
      } catch (err) {
        console.warn('[Camera] Constraint attempt failed:', err)
      }
    }

    if (mediaStream) {
      setStream(mediaStream)
      setPermission('granted')
    } else {
      setPermission('denied')
    }
  }, [haptic])

  // ── Upload Button Handler (Opens photo gallery) ──
  const handleGalleryOption = useCallback(() => {
    haptic(10)
    galleryInputRef.current?.click()
  }, [haptic])

  // ── Capture directly from live in-app video frame ──
  const handleCapture = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    haptic(20)
    setScanState('capturing')
    await new Promise((r) => setTimeout(r, 80))
    setScanState('detecting')

    try {
      const canvas = canvasRef.current || document.createElement('canvas')
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext('2d')
      let blob: Blob | null = null

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, 'image/jpeg', 0.88)
        )
      }

      const form = new FormData()
      if (blob) {
        form.append('image', blob, 'capture.jpg')
      }
      const res = await fetch('/api/detect-ingredients', { method: 'POST', body: form })
      const data = await res.json()
      setDetectedIngredients(data.ingredients ?? [])
    } catch (e) {
      console.error('[Detection Error]:', e)
      setDetectedIngredients([])
    }

    setScanState('confirmed')
    setSheetOpen(true)
  }, [haptic])

  // ── Find recipes ──
  const handleFindRecipes = useCallback(
    async (items: string[]) => {
      if (items.length === 0) return
      addPantryItems(items)
      const params = new URLSearchParams({ ingredients: items.join(',') })
      setSheetOpen(false)
      router.push(`/mobile/recipe-result?${params.toString()}`)
    },
    [router, addPantryItems]
  )

  const handleSheetClose = () => {
    setSheetOpen(false)
    setTimeout(() => setScanState('idle'), 300)
  }

  const isDetecting = scanState === 'detecting' || scanState === 'capturing'

  return (
    <>
      {/* Hidden canvas for video frame capture */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Hidden Gallery Input (Only opened when user taps 'Upload from Gallery') */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageFile(file)
          e.target.value = ''
        }}
      />

      {/* ── View Rendering ── */}
      {permission === 'requesting' ? (
        <LoadingScreen isDark={isDark} />
      ) : permission === 'granted' && stream ? (
        <CameraUI
          stream={stream}
          videoRef={videoRef}
          scanState={scanState}
          isDark={isDark}
          torchOn={torchOn}
          onCapture={handleCapture}
          onGallery={handleGalleryOption}
          onToggleTorch={toggleTorch}
          onBack={() => {
            stream.getTracks().forEach((t) => t.stop())
            setStream(null)
            setPermission('idle')
          }}
        />
      ) : (
        /* The Two-Options Screen: Scan (in-app live camera) or Upload from Gallery or Manual Entry */
        <TwoOptionsScreen
          isDark={isDark}
          permission={permission}
          onScan={handleScanOption}
          onGallery={handleGalleryOption}
          onManualEntry={handleManualEntry}
          onBack={() => router.back()}
        />
      )}

      {/* Global Detecting Spinner Overlay */}
      <AnimatePresence>
        {isDetecting && <DetectingOverlay />}
      </AnimatePresence>

      {/* Confirmation Bottom Sheet */}
      <ConfirmationSheet
        open={sheetOpen}
        ingredients={detectedIngredients}
        onClose={handleSheetClose}
        onFindRecipes={handleFindRecipes}
      />
    </>
  )
}
