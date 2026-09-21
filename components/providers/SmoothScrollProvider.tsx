'use client'

import React, { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Initialize high-performance, silky-smooth Lenis momentum scrolling
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.15,
      infinite: false,
      autoResize: true,
    })

    lenisRef.current = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    // Stop Lenis scroll when full-screen modal or camera is open
    const checkModalState = () => {
      if (document.body.classList.contains('hide-nav')) {
        lenis.stop()
      } else {
        lenis.start()
      }
    }

    const observer = new MutationObserver(checkModalState)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
