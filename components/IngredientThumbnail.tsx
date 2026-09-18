'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  cleanIngredientName,
  getIngredientEmoji,
  IngredientImageResult,
} from '@/lib/ingredientImages'

const LOCAL_STORAGE_KEY = 'mise_ingredient_images_v1'

// In-memory runtime cache for instant synchronous access across components
const RUNTIME_CACHE = new Map<string, IngredientImageResult>()

// Helper to safely read from localStorage
function readFromLocalStorage(key: string): IngredientImageResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed[key] || null
  } catch {
    return null
  }
}

// Helper to safely write to localStorage
function writeToLocalStorage(key: string, data: IngredientImageResult) {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    const store = raw ? JSON.parse(raw) : {}
    store[key] = {
      ingredient: data.ingredient,
      image: data.image,
      emoji: data.emoji,
    }
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Ignore storage quota or disabled localStorage errors
  }
}

interface IngredientThumbnailProps {
  name: string
  size?: number
  className?: string
  alt?: string
}

export default function IngredientThumbnail({
  name,
  size = 64,
  className = '',
  alt,
}: IngredientThumbnailProps) {
  const cleanName = cleanIngredientName(name)
  const fallbackEmoji = getIngredientEmoji(name)

  // Check if we have an immediate in-memory cached result
  const initialCache = RUNTIME_CACHE.get(cleanName)

  const [imageSrc, setImageSrc] = useState<string | null>(initialCache?.image ?? null)
  const [emoji, setEmoji] = useState<string>(initialCache?.emoji ?? fallbackEmoji)
  const [loading, setLoading] = useState<boolean>(!initialCache)
  const [imgLoaded, setImgLoaded] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  useEffect(() => {
    if (!cleanName) {
      setLoading(false)
      return
    }

    // 1. Check in-memory cache
    if (RUNTIME_CACHE.has(cleanName)) {
      const cached = RUNTIME_CACHE.get(cleanName)!
      setImageSrc(cached.image)
      setEmoji(cached.emoji)
      setLoading(false)
      return
    }

    // 2. Check localStorage
    const stored = readFromLocalStorage(cleanName)
    if (stored) {
      RUNTIME_CACHE.set(cleanName, stored)
      setImageSrc(stored.image)
      setEmoji(stored.emoji)
      setLoading(false)
      return
    }

    // 3. Fetch from API route
    let isCancelled = false
    setLoading(true)
    setHasError(false)

    async function fetchImage() {
      try {
        const res = await fetch(`/api/ingredient-image?name=${encodeURIComponent(cleanName)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: IngredientImageResult = await res.json()

        if (!isCancelled) {
          RUNTIME_CACHE.set(cleanName, data)
          writeToLocalStorage(cleanName, data)
          setImageSrc(data.image)
          setEmoji(data.emoji || fallbackEmoji)
          setLoading(false)
        }
      } catch (err) {
        console.warn(`[IngredientThumbnail] Failed to fetch image for ${cleanName}:`, err)
        if (!isCancelled) {
          const fallbackData: IngredientImageResult = {
            ingredient: cleanName,
            image: null,
            emoji: fallbackEmoji,
          }
          RUNTIME_CACHE.set(cleanName, fallbackData)
          writeToLocalStorage(cleanName, fallbackData)
          setImageSrc(null)
          setEmoji(fallbackEmoji)
          setLoading(false)
        }
      }
    }

    fetchImage()

    return () => {
      isCancelled = true
    }
  }, [cleanName, fallbackEmoji])

  const dimensionStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
  }

  // Fallback state: no image found or image failed to load
  const showEmoji = !loading && (!imageSrc || hasError)

  return (
    <div
      className={`relative rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 ${className}`}
      style={dimensionStyle}
      title={name}
      aria-label={name}
    >
      {/* ── Skeleton Loader (shown during network fetch or while image bytes are loading) ── */}
      {(loading || (!imgLoaded && !showEmoji)) && (
        <div className="absolute inset-0 bg-stone-200/70 dark:bg-stone-700/60 animate-pulse flex items-center justify-center">
          <span className="text-xl opacity-30 select-none">{fallbackEmoji}</span>
        </div>
      )}

      {/* ── Verified Pexels Image ── */}
      {imageSrc && !hasError && (
        <Image
          src={imageSrc}
          alt={alt || name}
          fill
          unoptimized
          sizes={`${size}px`}
          className={`object-cover transition-opacity duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            console.warn(`[IngredientThumbnail] Image failed to load for ${name}, falling back to emoji.`)
            setHasError(true)
          }}
        />
      )}

      {/* ── Emoji Fallback (when no verified isolated food image exists) ── */}
      {showEmoji && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100/90 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 select-none">
          <span
            className="transform transition-transform duration-200 hover:scale-110"
            style={{ fontSize: `${Math.round(size * 0.46)}px`, lineHeight: 1 }}
          >
            {emoji}
          </span>
        </div>
      )}
    </div>
  )
}
