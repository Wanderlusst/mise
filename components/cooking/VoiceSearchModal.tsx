'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, X, AlertCircle, RefreshCw, ArrowRight, Check, Volume2 } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'

interface VoiceSearchModalProps {
  open: boolean
  onClose: () => void
  onSelectIngredient: (phrase: string) => void
}

type MicStatus = 'idle' | 'requesting' | 'listening' | 'processing' | 'denied' | 'unsupported'

function cleanTranscriptText(text: string): string {
  return text
    .replace(/^(i have|i've got|find|search for|recipes with|show me|cook with|give me|tell me|make)\s+/i, '')
    .replace(/[.!?]+$/, '')
    .trim()
}

export function VoiceSearchModal({
  open,
  onClose,
  onSelectIngredient,
}: VoiceSearchModalProps) {
  const haptic = useHaptic()

  const [status, setStatus] = useState<MicStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [volumeLevel, setVolumeLevel] = useState(0) // 0 to 1
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ── Clean Up Everything ──
  const stopAllAudio = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close()
      } catch {
        // ignore
      }
      audioCtxRef.current = null
    }
    setVolumeLevel(0)
  }, [])

  // ── Finalize & Submit Query ──
  const handleFinalSubmit = useCallback(
    (textToSubmit: string) => {
      const clean = cleanTranscriptText(textToSubmit)
      if (!clean) return
      haptic(15)
      stopAllAudio()
      onSelectIngredient(clean)
      onClose()
    },
    [haptic, onSelectIngredient, onClose, stopAllAudio]
  )

  // ── Server-Side Whisper Fallback (via recorded audio Blob) ──
  const processRecordedAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return
    setStatus('processing')

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const form = new FormData()
      form.append('audio', audioBlob, 'voice.webm')

      const res = await fetch('/api/transcribe-voice', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) throw new Error('Transcription failed')
      const data = await res.json()
      if (data.transcript) {
        setTranscript(data.transcript)
        handleFinalSubmit(data.transcript)
        return
      }
    } catch (err) {
      console.warn('[Server transcription fallback failed]:', err)
    }

    setStatus('listening')
  }, [handleFinalSubmit])

  // ── Start Recording & Speech Recognition ──
  const startRecording = useCallback(async () => {
    stopAllAudio()
    setTranscript('')
    setInterimText('')
    setErrorMessage(null)
    setStatus('requesting')

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      setErrorMessage('Audio recording is not supported in this browser.')
      return
    }

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // 2. Setup AudioContext for Live Volume Visualizer
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass()
          audioCtxRef.current = audioCtx
          const source = audioCtx.createMediaStreamSource(stream)
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 64
          analyser.smoothingTimeConstant = 0.8
          source.connect(analyser)

          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          const updateMeter = () => {
            if (!analyser) return
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i]
            }
            const avg = sum / dataArray.length
            const normalized = Math.min(1, avg / 90) // normalized level
            setVolumeLevel(normalized)
            animFrameRef.current = requestAnimationFrame(updateMeter)
          }
          updateMeter()
        }
      } catch (audioMeterErr) {
        console.warn('[Audio meter setup ignored]:', audioMeterErr)
      }

      setStatus('listening')
      haptic(12)

      // 3. Setup Web Speech Recognition (if available in browser)
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass()
        recognitionRef.current = recognition
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        let recognizedFinal = ''

        recognition.onresult = (event: any) => {
          let currentInterim = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const text = result[0].transcript
            if (result.isFinal) {
              recognizedFinal += (recognizedFinal ? ' ' : '') + text
            } else {
              currentInterim += text
            }
          }

          const combined = recognizedFinal || currentInterim
          setTranscript(recognizedFinal)
          setInterimText(currentInterim)

          // Reset silence debounce timer to auto-submit when user stops speaking
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
          if (combined.trim().length > 2) {
            silenceTimerRef.current = setTimeout(() => {
              handleFinalSubmit(combined)
            }, 1800)
          }
        }

        recognition.onerror = (event: any) => {
          console.warn('[SpeechRecognition Error]:', event.error)
          if (event.error === 'not-allowed') {
            setStatus('denied')
            setErrorMessage('Microphone access was denied in browser settings.')
          }
        }

        recognition.onend = () => {
          // If still listening and modal is open, restart recognition
          if (status === 'listening' && streamRef.current) {
            try {
              recognition.start()
            } catch {
              // ignore
            }
          }
        }

        try {
          recognition.start()
        } catch (recStartErr) {
          console.warn('[SpeechRecognition start error]:', recStartErr)
        }
      } else {
        // Fallback: Setup MediaRecorder for server-side Whisper processing
        try {
          audioChunksRef.current = []
          const recorder = new MediaRecorder(stream)
          mediaRecorderRef.current = recorder
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data)
            }
          }
          recorder.onstop = () => {
            processRecordedAudio()
          }
          recorder.start(250)
        } catch (recErr) {
          console.warn('[MediaRecorder fallback error]:', recErr)
        }
      }
    } catch (err: any) {
      console.warn('[Microphone Permission Error]:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied')
        setErrorMessage('Microphone permission was denied. Please allow microphone access to search by voice.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setStatus('unsupported')
        setErrorMessage('No microphone device found on this system.')
      } else {
        setStatus('denied')
        setErrorMessage('Could not activate microphone. Please check your browser settings.')
      }
    }
  }, [stopAllAudio, haptic, handleFinalSubmit, processRecordedAudio, status])

  // Start microphone whenever modal opens, stop cleanly when modal closes
  useEffect(() => {
    if (open) {
      startRecording()
    } else {
      stopAllAudio()
      setStatus('idle')
      setTranscript('')
      setInterimText('')
    }
    return () => {
      stopAllAudio()
    }
  }, [open, startRecording, stopAllAudio])

  const displayText = interimText || transcript

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="voice-search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-5 select-none"
          style={{
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={() => {
            stopAllAudio()
            onClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 8, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[36px] p-6 text-center relative border overflow-hidden shadow-2xl"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--bg-card-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                haptic(6)
                stopAllAudio()
                onClose()
              }}
              aria-label="Close voice search"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer z-20"
              style={{
                background: 'var(--bg-page)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--bg-card-border)',
              }}
            >
              <X size={16} strokeWidth={2.2} />
            </button>

            {/* ── Microphone Visualizer ── */}
            <div className="relative w-32 h-32 mx-auto my-3 flex items-center justify-center">
              {status === 'listening' && (
                <>
                  {/* Outer volume reactive wave */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--accent)' }}
                    animate={{
                      scale: 1 + volumeLevel * 0.7,
                      opacity: 0.12 + volumeLevel * 0.3,
                    }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />

                  {/* Mid reactive wave */}
                  <motion.div
                    className="absolute inset-2 rounded-full"
                    style={{ background: 'var(--accent)' }}
                    animate={{
                      scale: 1 + volumeLevel * 0.45,
                      opacity: 0.2 + volumeLevel * 0.4,
                    }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </>
              )}

              {/* Status Circle Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (status === 'denied' || status === 'unsupported') {
                    startRecording()
                  } else if (displayText.trim()) {
                    handleFinalSubmit(displayText)
                  }
                }}
                className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer"
                style={{
                  background:
                    status === 'denied'
                      ? '#ef4444'
                      : status === 'processing'
                      ? 'var(--text-secondary)'
                      : 'var(--accent)',
                  boxShadow:
                    status === 'listening'
                      ? '0 12px 30px rgba(217, 113, 60, 0.45)'
                      : '0 8px 24px rgba(0, 0, 0, 0.25)',
                }}
              >
                {status === 'requesting' || status === 'processing' ? (
                  <motion.div
                    className="w-7 h-7 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : status === 'denied' ? (
                  <AlertCircle size={30} strokeWidth={2.2} />
                ) : (
                  <Mic
                    size={30}
                    strokeWidth={2.2}
                    className={status === 'listening' && volumeLevel > 0.1 ? 'animate-pulse' : ''}
                  />
                )}
              </motion.button>
            </div>

            {/* ── Heading & Status ── */}
            <h3
              className="text-lg font-apple font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {status === 'requesting'
                ? 'Activating microphone…'
                : status === 'processing'
                ? 'Searching ingredients…'
                : status === 'denied'
                ? 'Microphone Blocked'
                : status === 'unsupported'
                ? 'Microphone Unavailable'
                : displayText
                ? 'Heard you!'
                : 'Listening for ingredients…'}
            </h3>

            <p
              className="text-xs leading-relaxed mt-1 mb-4 max-w-[280px] mx-auto min-h-[32px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {errorMessage ||
                (displayText
                  ? 'Tap below or pause to search directly'
                  : 'Say what’s in your kitchen, e.g. “garlic, pasta, cherry tomatoes”')}
            </p>

            {/* ── Live Recognized Speech Bubble ── */}
            <AnimatePresence>
              {displayText ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="p-3.5 rounded-2xl mb-4 border flex items-center justify-between gap-3 text-left"
                  style={{
                    background: 'var(--bg-page)',
                    borderColor: 'var(--accent)',
                    boxShadow: '0 4px 16px rgba(217, 113, 60, 0.12)',
                  }}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      <Volume2 size={14} />
                    </div>
                    <span
                      className="text-sm font-semibold truncate capitalize"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {cleanTranscriptText(displayText)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleFinalSubmit(displayText)}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                    style={{ background: 'var(--accent)' }}
                  >
                    <span>Search</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* ── Retry Action if Denied ── */}
            {status === 'denied' && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={startRecording}
                className="w-full py-3 mb-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-white"
                style={{ background: 'var(--accent)' }}
              >
                <RefreshCw size={14} strokeWidth={2.2} />
                <span>Try Again</span>
              </motion.button>
            )}

            {/* ── Quick Sample Prompts ── */}
            <div className="space-y-1.5 text-left">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Or tap a suggestion:
              </span>

              {[
                'Garlic, pasta and olive oil',
                'Tomatoes, eggs and spinach',
                'Rice, scallions and soy sauce',
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    handleFinalSubmit(sample)
                  }}
                  className="w-full py-2.5 px-3.5 rounded-2xl text-xs font-medium hover:opacity-90 transition-all flex items-center justify-between cursor-pointer"
                  style={{
                    background: 'var(--bg-page)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--bg-card-border)',
                  }}
                >
                  <span>“{sample}”</span>
                  <ArrowRight size={12} style={{ color: 'var(--accent)' }} />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
