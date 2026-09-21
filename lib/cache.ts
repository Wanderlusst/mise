/**
 * lib/cache.ts
 *
 * Lightweight in-memory LRU/TTL cache for query results.
 * Reduces latency to < 5ms for repeated pantry/filter queries and prevents duplicate LLM billing.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class TTLCache<T = any> {
  private store = new Map<string, CacheEntry<T>>()
  private maxEntries: number
  private defaultTtlMs: number

  constructor(maxEntries = 500, defaultTtlMs = 10 * 60 * 1000) {
    this.maxEntries = maxEntries
    this.defaultTtlMs = defaultTtlMs
  }

  public get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    // Refresh LRU order by re-inserting
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs
    const expiresAt = Date.now() + ttl

    // Enforce max capacity by evicting oldest item (first in Map iteration order)
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value
      if (oldestKey) {
        this.store.delete(oldestKey)
      }
    }

    this.store.set(key, { value, expiresAt })
  }

  public delete(key: string): boolean {
    return this.store.delete(key)
  }

  public clear(): void {
    this.store.clear()
  }

  public size(): number {
    return this.store.size
  }
}

// Global query cache for recipe matching (TTL: 15 minutes, Max: 500 entries)
export const recipeMatchCache = new TTLCache<any[]>(500, 15 * 60 * 1000)

/**
 * Creates a deterministic cache key from match query parameters.
 */
export function buildMatchCacheKey(params: {
  ingredients?: string[] | null
  category?: string | null
  diet?: string | null
  time?: number | null
  servings?: number
  region?: string | null
  allergies?: string[] | null
  pantryStaples?: string[] | null
}): string {
  const normIng = (params.ingredients || [])
    .map((i) => i.trim().toLowerCase())
    .sort()
    .join('|')

  const normAllergies = (params.allergies || [])
    .map((a) => a.trim().toLowerCase())
    .sort()
    .join('|')

  const normStaples = (params.pantryStaples || [])
    .map((s) => s.trim().toLowerCase())
    .sort()
    .join('|')

  return [
    `ing:${normIng}`,
    `cat:${(params.category || '').toLowerCase()}`,
    `diet:${(params.diet || '').toLowerCase()}`,
    `time:${params.time ?? ''}`,
    `servings:${params.servings ?? 2}`,
    `region:${(params.region || '').toLowerCase()}`,
    `allergies:${normAllergies}`,
    `staples:${normStaples}`,
  ].join('#')
}
