'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { Clock, Users, Leaf, Droplets, Flame } from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { StatRow } from '@/components/StatChip'
import { useHaptic } from '@/lib/useHaptic'

// ── Mock capture result ────────────────────────────────────────────
const MOCK_CAPTURE = {
  name: 'Vegetable Salad',
  weight: '350 g',
  image: '/food/salad.jpg',
  chips: [
    { icon: <Leaf size={14} strokeWidth={1.5} />, value: '25.4%', label: 'Carbs', iconColor: 'text-stone-600' },
    { icon: <Droplets size={14} strokeWidth={1.5} />, value: '60.2%', label: 'Fats', iconColor: 'text-saffron-400' },
    { icon: <Flame size={14} strokeWidth={1.5} />, value: '5.6%', label: 'Sugar', iconColor: 'text-red-400' },
  ],
}

// ── Animated scan brackets ─────────────────────────────────────────
function ScanBrackets({ animate }: { animate: boolean }) {
  const size = 200
  const cornerLen = 32
  const stroke = 3

  const corners = [
    // top-left
    { x1: 0, y1: cornerLen, x2: 0, y2: 0, x3: cornerLen, y3: 0 },
    // top-right
    { x1: size - cornerLen, y1: 0, x2: size, y2: 0, x3: size, y3: cornerLen },
    // bottom-right
    { x1: size, y1: size - cornerLen, x2: size, y2: size, x3: size - cornerLen, y3: size },
    // bottom-left
    { x1: cornerLen, y1: size, x2: 0, y2: size, x3: 0, y3: size - cornerLen },
  ]

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 pointer-events-none"
      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      animate={animate ? { opacity: [0.8, 1, 0.8] } : { opacity: 0.6 }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {corners.map((c, i) => (
        <polyline
          key={i}
          points={`${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x3},${c.y3}`}
          fill="none"
          stroke="#D9A441"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </motion.svg>
  )
}

// ── Result bottom sheet ────────────────────────────────────────────
function ResultSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-950/30 backdrop-blur-sm z-20"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="absolute bottom-0 inset-x-0 z-30 bg-white rounded-t-[32px] shadow-glass-heavy"
          >
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-4 mb-5" />

            {/* Food photo */}
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-glass mx-auto mb-4">
              <Image
                src={MOCK_CAPTURE.image}
                alt={MOCK_CAPTURE.name}
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>

            {/* Name + weight */}
            <div className="text-center mb-5 px-6">
              <h2 className="text-display text-stone-900 font-bold">{MOCK_CAPTURE.name}</h2>
              <p className="text-label-lg text-stone-500 mt-1">{MOCK_CAPTURE.weight}</p>
            </div>

            {/* Stat chips */}
            <div className="px-8 mb-8">
              <StatRow chips={MOCK_CAPTURE.chips} />
            </div>

            {/* CTA */}
            <div className="px-6 pb-10">
              <button
                onClick={onClose}
                className="w-full h-14 rounded-pill bg-stone-800 text-white
                           font-semibold text-label-lg hover:bg-stone-700 transition-colors"
              >
                View Full Recipe
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Screen 2: Scan ─────────────────────────────────────────────────
export default function ScanPage() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [captured, setCaptured] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const haptic = useHaptic()

  // Start camera
  useEffect(() => {
    let ms: MediaStream
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        ms = s
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(() => {
        // Camera not available (e.g. desktop dev) — show placeholder
      })
    return () => {
      ms?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const handleCapture = () => {
    haptic(15)
    setCaptured(true)
    // Simulated detect delay, then open sheet
    setTimeout(() => setSheetOpen(true), 600)
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-stone-950">
      {/* Full-bleed camera / placeholder */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        /* Gradient placeholder when camera unavailable */
        <div className="absolute inset-0 bg-gradient-to-b from-olive-800 to-olive-900 flex items-center justify-center">
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-stone-700/40">
            <Image
              src="/food/salad.jpg"
              alt="Scan preview"
              fill
              className="object-cover opacity-60"
              sizes="256px"
            />
          </div>
        </div>
      )}

      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-olive-900/60 via-transparent to-olive-900/80 pointer-events-none" />

      {/* Scan brackets — centred on screen */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative" style={{ width: 200, height: 200 }}>
          <ScanBrackets animate={!captured} />
        </div>
      </div>

      {/* Top label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-20 inset-x-0 text-center"
        style={{ top: 'max(5rem, calc(env(safe-area-inset-top) + 3rem))' }}
      >
        <p className="text-white text-label-lg font-medium">
          Point at your ingredients
        </p>
        <p className="text-stone-200/60 text-label mt-1">
          Hold steady for best results
        </p>
      </motion.div>

      {/* Shutter button — bottom centre, single animated moment */}
      <motion.div
        className="absolute bottom-0 inset-x-0 flex justify-center"
        style={{ paddingBottom: 'max(7rem, calc(env(safe-area-inset-bottom) + 6rem))' }}
      >
        <motion.button
          id="shutter-btn"
          aria-label="Capture photo"
          whileTap={{ scale: 0.9, opacity: 0.85 }}
          onClick={handleCapture}
          disabled={sheetOpen}
          className="w-20 h-20 rounded-full bg-white shadow-center-btn
                     flex items-center justify-center relative"
        >
          {/* Inner ring */}
          <div className="w-[68px] h-[68px] rounded-full border-4 border-stone-900/30 bg-white" />
          {/* Capture flash */}
          <AnimatePresence>
            {captured && (
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-white pointer-events-none"
              />
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Result sheet */}
      <ResultSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setCaptured(false) }} />
    </div>
  )
}
