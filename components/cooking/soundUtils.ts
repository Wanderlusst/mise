'use client'

// Subtle Apple-like culinary acoustic feedback using native Web Audio API
export function playChime(type: 'success' | 'stepComplete' | 'timerDone' | 'click' = 'stepComplete') {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime

    if (type === 'stepComplete') {
      // Pleasant dual-tone chime (F5 -> A5)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'triangle'

      osc1.frequency.setValueAtTime(698.46, now) // F5
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.15) // A5

      osc2.frequency.setValueAtTime(1396.9, now) // F6 harmonic
      osc2.frequency.exponentialRampToValueAtTime(1760.0, now + 0.15)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.46)
      osc2.stop(now + 0.46)
    } else if (type === 'success') {
      // Major triad victory chime (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteStart = now + idx * 0.08

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, noteStart)

        gain.gain.setValueAtTime(0.001, noteStart)
        gain.gain.linearRampToValueAtTime(0.14, noteStart + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.6)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(noteStart)
        osc.stop(noteStart + 0.65)
      })
    } else if (type === 'timerDone') {
      // Soft gentle bell double-tap
      ;[0, 0.18].forEach((offset) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = now + offset

        osc.type = 'sine'
        osc.frequency.setValueAtTime(987.77, start) // B5

        gain.gain.setValueAtTime(0.001, start)
        gain.gain.linearRampToValueAtTime(0.15, start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.36)
      })
    } else if (type === 'click') {
      // Very soft micro-click
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.05)
    }
  } catch {
    // AudioContext failure (autoplay policy or missing API) gracefully ignored
  }
}
