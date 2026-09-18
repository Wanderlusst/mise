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

// ─── Types ─────────────────────────────────────────────────────────────────────
type CameraPermission = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'
type ScanState = 'idle' | 'capturing' | 'detecting' | 'confirmed'

// ─── Scan Brackets ─────────────────────────────────────────────────────────────
function ScanBrackets({ animate }: { animate: boolean }) {
  const reducedMotion = useReducedMotion()
  const size = 210
  const cornerLen = 32
  const stroke = 2.5
  const AMBER = '#D9A441'

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
          'linear-gradient(90deg, transparent, #D9A441cc, #D9A441, #FFA371cc, transparent)',
        boxShadow: '0 0 10px rgba(217,164,65,0.85), 0 0 22px rgba(255,163,113,0.4)',
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
        bg-[#f0ede8] dark:bg-white/10
        text-stone-800 dark:text-white/90
        border border-stone-200 dark:border-white/10"
    >
      {name}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center
          text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
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
              bg-white dark:bg-[#1c1c1e]
              border-t border-stone-200 dark:border-white/10
              shadow-[0_-16px_48px_rgba(0,0,0,0.45)] max-w-[430px] mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-stone-100 dark:border-white/[0.07]">
              <div>
                <h2 className="text-stone-900 dark:text-white font-bold text-base font-apple">
                  Detected Ingredients & Drinks
                </h2>
                <p className="text-stone-400 dark:text-white/40 text-xs mt-0.5">
                  Review and edit before brewing or cooking
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center
                  text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer
                  bg-stone-100 dark:bg-white/10"
                aria-label="Close"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-stone-400 text-sm italic text-center py-4">
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
                    bg-stone-100 dark:bg-white/10
                    text-stone-900 dark:text-white
                    placeholder:text-stone-400
                    border border-stone-200 dark:border-white/10
                    focus:outline-none focus:ring-2 focus:ring-[#D9A441]/50 transition-all"
                />
                <button
                  onClick={handleAdd}
                  disabled={!inputVal.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center
                    bg-stone-900 dark:bg-white/15 text-white
                    disabled:opacity-40 hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
                  aria-label="Add ingredient"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pt-3 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] border-t border-stone-100 dark:border-white/[0.07] bg-white dark:bg-[#1c1c1e] shrink-0">
              <motion.button
                id="brew-or-cook-btn"
                whileTap={{ scale: 0.98 }}
                onClick={handleFind}
                disabled={items.length === 0 || isFinding}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5
                  bg-gradient-to-r from-[#D9A441] to-[#FFA371] hover:brightness-105 active:scale-[0.98] disabled:opacity-50 text-stone-950
                  shadow-lg shadow-[#D9A441]/25 transition-all cursor-pointer font-apple"
              >
                {isFinding ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full"
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
      style={{ background: isDark ? '#0f0f0f' : '#faf8f5' }}
    >
      <motion.div
        className="w-14 h-14 rounded-full border-2 border-t-[#D9A441]"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          borderTopColor: '#D9A441',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      <p
        className="text-sm font-medium"
        style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
      >
        Starting camera in browser…
      </p>
    </div>
  )
}

// ─── Clean Two-Options Screen (Scan or Upload only) ─────────────────────────────
function TwoOptionsScreen({
  isDark,
  permission,
  onScan,
  onGallery,
  onBack,
}: {
  isDark: boolean
  permission: CameraPermission
  onScan: () => void
  onGallery: () => void
  onBack: () => void
}) {
  const bg = isDark ? '#121212' : '#faf8f5'
  const textPrimary = isDark ? '#ffffff' : '#1c1917'
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  const backBtnBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'
  const backBtnBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden select-none"
      style={{
        background: bg,
        paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
        paddingBottom: 'max(6.5rem, calc(env(safe-area-inset-bottom) + 5rem))',
      }}
    >
      {/* Subtle radial ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(217,164,65,0.14) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(217,164,65,0.1) 0%, transparent 70%)',
        }}
      />

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

      {/* Center Section: Title & Two Clean Action Options */}
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
              background: isDark ? 'rgba(217,164,65,0.15)' : 'rgba(217,164,65,0.12)',
              color: '#D9A441',
              border: '1px solid rgba(217,164,65,0.25)',
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
            Open camera live in app or choose a photo from your gallery.
          </p>

          {/* Browser Camera Permission Notification (if blocked) */}
          {permission === 'denied' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
              }}
            >
              <AlertCircle size={14} strokeWidth={2.2} />
              <span>Camera blocked. Tap &quot;Camera Scan&quot; to allow.</span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Two Options (Scan or Upload) ── */}
        <div className="space-y-4">
          {/* Option 1: Scan with Camera (Opens live camera inside app) */}
          <motion.button
            id="option-scan-camera"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={onScan}
            className="w-full p-4 rounded-3xl flex items-center justify-between text-left cursor-pointer transition-all"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              border: isDark
                ? '1px solid rgba(217,164,65,0.3)'
                : '1px solid rgba(217,164,65,0.35)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isDark
                ? '0 10px 30px -5px rgba(0,0,0,0.4), 0 0 20px rgba(217,164,65,0.1)'
                : '0 10px 30px -5px rgba(217,164,65,0.12), 0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #D9A441 0%, #FFA371 100%)',
                  boxShadow: '0 6px 18px rgba(217,164,65,0.35)',
                }}
              >
                <Camera size={26} strokeWidth={2.2} className="text-stone-950" />
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
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
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
              background: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.92)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(0,0,0,0.07)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isDark
                ? '0 10px 30px -5px rgba(0,0,0,0.3)'
                : '0 8px 24px -4px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <ImagePlus
                  size={24}
                  strokeWidth={2}
                  style={{ color: isDark ? '#ffffff' : '#292524' }}
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
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
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
            <Zap size={17} strokeWidth={2} style={{ color: '#D9A441' }} />
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
        {isDetecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              className="w-12 h-12 border-2 border-white/20 border-t-[#D9A441] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-white font-semibold text-sm">Detecting ingredients…</p>
          </motion.div>
        )}
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
  const isDark = settings.theme === 'dark'

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
      const params = new URLSearchParams({ ingredients: items.join(',') })
      setSheetOpen(false)
      router.push(`/mobile/recipe-result?${params.toString()}`)
    },
    [router]
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
        /* The Two-Options Screen: Scan (in-app live camera) or Upload from Gallery */
        <TwoOptionsScreen
          isDark={isDark}
          permission={permission}
          onScan={handleScanOption}
          onGallery={handleGalleryOption}
          onBack={() => router.back()}
        />
      )}

      {/* Global Detecting Spinner Overlay */}
      <AnimatePresence>
        {isDetecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              className="w-14 h-14 border-3 border-white/20 border-t-[#D9A441] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-white font-semibold text-sm">Detecting ingredients…</p>
          </motion.div>
        )}
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
