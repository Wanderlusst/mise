'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Check } from 'lucide-react'
import { playChime } from './soundUtils'
import { useHaptic } from '@/lib/useHaptic'

interface CircularProgressTimerProps {
  durationMinutes: number
  isActive?: boolean
  onComplete?: () => void
  className?: string
  size?: number
}

export default function CircularProgressTimer({
  durationMinutes,
  isActive = true,
  onComplete,
  className = '',
  size = 148,
}: CircularProgressTimerProps) {
  const haptic = useHaptic()
  const initialTotalSeconds = Math.max(1, Math.round(durationMinutes * 60))
  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds)
  const [secondsLeft, setSecondsLeft] = useState(initialTotalSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Re-sync if durationMinutes changes
  useEffect(() => {
    const s = Math.max(1, Math.round(durationMinutes * 60))
    setTotalSeconds(s)
    setSecondsLeft(s)
    setRunning(false)
  }, [durationMinutes])

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleTimerComplete = useCallback(() => {
    clear()
    setRunning(false)
    setSecondsLeft(0)
    playChime('timerDone')
    haptic([30, 80, 30, 80, 40])
    if (onComplete) onComplete()
  }, [clear, haptic, onComplete])

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clear()
    }
    return clear
  }, [running, clear, secondsLeft, handleTimerComplete])

  const toggleRunning = () => {
    haptic(15)
    playChime('click')
    setRunning(!running)
  }

  const reset = () => {
    haptic(10)
    playChime('click')
    clear()
    setRunning(false)
    setSecondsLeft(totalSeconds)
  }

  const addOneMinute = () => {
    haptic(12)
    playChime('click')
    setTotalSeconds((prev) => prev + 60)
    setSecondsLeft((prev) => prev + 60)
  }

  // Formatting
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  // Progress metrics
  const elapsed = totalSeconds - secondsLeft
  const progressRatio = totalSeconds > 0 ? elapsed / totalSeconds : 0
  const percentComplete = Math.min(100, Math.round(progressRatio * 100))
  const percentRemaining = Math.max(0, 100 - percentComplete)

  // Color dynamics: Sage -> Amber -> Urgent Coral
  const isUrgent = (secondsLeft <= 30 && secondsLeft > 0) || (percentRemaining <= 15 && secondsLeft > 0)
  const isMid = percentRemaining <= 50 && !isUrgent
  const isDone = secondsLeft === 0

  const ringColor = isDone
    ? 'var(--success)'
    : isUrgent
    ? 'var(--accent)'
    : 'var(--accent)'

  const ringTrackBg = isDone
    ? 'var(--success-bg)'
    : 'rgba(217, 113, 60, 0.12)'

  // SVG metrics
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // Progress flows clockwise: 0 offset at 0% completed, decreasing offset as progress fills
  const strokeDashoffset = circumference * (1 - progressRatio)

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* ── Apple Watch Circular Ring ── */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glow halo when urgent or running */}
        <AnimatePresence>
          {running && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={
                isUrgent
                  ? {
                      boxShadow: [
                        '0 0 16px rgba(239,68,68,0.2)',
                        '0 0 32px rgba(239,68,68,0.45)',
                        '0 0 16px rgba(239,68,68,0.2)',
                      ],
                    }
                  : {
                      boxShadow: [
                        '0 0 12px rgba(217,164,65,0.15)',
                        '0 0 20px rgba(217,164,65,0.3)',
                        '0 0 12px rgba(217,164,65,0.15)',
                      ],
                    }
              }
              transition={{ duration: isUrgent ? 0.9 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center"
        >
          {/* Subtle background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringTrackBg}
            strokeWidth={strokeWidth}
          />

          {/* Animated active progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {/* Percentage badge */}
          <div className="flex items-center gap-0.5 text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 mb-0.5">
            <span>○</span>
            <span>{percentComplete}%</span>
          </div>

          {/* Time text */}
          <span
            className="text-2xl font-mono font-bold tracking-tight tabular-nums"
            style={{
              color: isDone ? 'var(--success)' : isUrgent ? 'var(--accent)' : undefined,
            }}
          >
            {isDone ? '00:00' : timeStr}
          </span>

          {/* Status micro label */}
          <span
            className="text-[10px] font-medium tracking-wide uppercase mt-0.5"
            style={{
              color: isDone ? 'var(--success)' : isUrgent ? 'var(--accent)' : ringColor,
            }}
          >
            {isDone ? 'Completed' : running ? 'Cooking' : 'Paused'}
          </span>
        </div>
      </div>

      {/* ── Timer Controls with tactile micro-interactions ── */}
      <div className="flex items-center gap-2 mt-3">
        {/* Reset button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9, rotate: -45 }}
          onClick={reset}
          aria-label="Reset timer"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--text-secondary)] shadow-xs hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
        </motion.button>

        {/* Primary Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={toggleRunning}
          disabled={isDone}
          aria-label={running ? 'Pause timer' : 'Start timer'}
          className="flex items-center gap-1.5 px-4 h-9 rounded-full font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
          style={{
            background: isDone
              ? 'var(--success-bg)'
              : running
              ? 'var(--bg-card)'
              : 'var(--accent)',
            color: isDone ? 'var(--success)' : running ? 'var(--accent)' : 'white',
            border: `1px solid ${
              isDone
                ? 'var(--success)'
                : 'var(--accent)'
            }`,
          }}
        >
          {isDone ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Done</span>
            </>
          ) : running ? (
            <>
              <Pause size={13} fill="currentColor" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" />
              <span>Start</span>
            </>
          )}
        </motion.button>

        {/* Quick +1 Min Bump */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={addOneMinute}
          aria-label="Add 1 minute"
          className="flex items-center justify-center px-2.5 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[11px] font-mono font-semibold text-[var(--text-secondary)] shadow-xs hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Plus size={12} className="mr-0.5" />
          1m
        </motion.button>
      </div>
    </div>
  )
}
