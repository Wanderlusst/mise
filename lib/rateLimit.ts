/**
 * lib/rateLimit.ts
 *
 * In-memory sliding window rate limiter for Next.js API routes.
 * Protects costly AI and database routes from DoS and Denial-of-Wallet attacks.
 */

import { NextRequest } from 'next/server'

interface RateLimitRecord {
  timestamps: number[]
}

interface RateLimitOptions {
  limit?: number       // Max requests allowed within windowMs
  windowMs?: number    // Sliding window size in milliseconds
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number        // Seconds until current window fully resets
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Automatically sweep expired entries every 5 minutes to prevent memory leaks
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref()
      }
    }
  }

  public check(identifier: string, options: RateLimitOptions = {}): RateLimitResult {
    const limit = options.limit ?? 30
    const windowMs = options.windowMs ?? 60 * 1000
    const now = Date.now()
    const windowStart = now - windowMs

    let record = this.store.get(identifier)
    if (!record) {
      record = { timestamps: [] }
      this.store.set(identifier, record)
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0]
      const resetSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000))
      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetSeconds,
      }
    }

    record.timestamps.push(now)
    const remaining = Math.max(0, limit - record.timestamps.length)
    const oldestInWindow = record.timestamps[0]
    const resetSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000))

    return {
      success: true,
      limit,
      remaining,
      reset: resetSeconds,
    }
  }

  public reset(identifier?: string) {
    if (identifier) {
      this.store.delete(identifier)
    } else {
      this.store.clear()
    }
  }

  private cleanup() {
    const now = Date.now()
    const maxAge = 10 * 60 * 1000 // 10 minutes
    this.store.forEach((record, id) => {
      record.timestamps = record.timestamps.filter((ts: number) => now - ts < maxAge)
      if (record.timestamps.length === 0) {
        this.store.delete(id)
      }
    })
  }
}

// Global singleton instance
export const rateLimiter = new InMemoryRateLimiter()

/**
 * Extracts a client IP address safely from NextRequest headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  const cfConnecting = req.headers.get('cf-connecting-ip')
  if (cfConnecting) return cfConnecting.trim()

  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return '127.0.0.1'
}
