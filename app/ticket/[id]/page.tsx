'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

interface RecipeStep {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number | null
  parallel: boolean
}

interface Ingredient {
  name: string
  quantity: string
  optional: boolean
}

interface AdaptedRecipe {
  id: string
  name: string
  category: string
  time_minutes: number
  servings: number
  ingredients: Ingredient[]
  steps: RecipeStep[]
  adapted: boolean
  adaptationReason?: string
  substitutions?: Array<{ original: string; substitute: string; note: string }>
}

function TicketContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const recipeId = params.id as string

  const ingredientsParam = searchParams.get('ingredients') ?? ''
  const servings = searchParams.get('servings') ?? '2'
  const ingredients = ingredientsParam.split(',').filter(Boolean)

  const [recipe, setRecipe] = useState<AdaptedRecipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchAdapted() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/adapt-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeId,
            ingredients,
            servings: Number(servings),
            timeConstraint: null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load recipe')
        setRecipe(data)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchAdapted()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId])

  const buildPlainText = () => {
    if (!recipe) return ''
    let text = `${recipe.name}\n`
    text += `${'─'.repeat(recipe.name.length)}\n`
    text += `Serves ${recipe.servings} | ~${recipe.time_minutes} min\n\n`
    text += `INGREDIENTS\n`
    for (const ing of recipe.ingredients) {
      text += `  ${ing.quantity.padEnd(14)} ${ing.name}${ing.optional ? ' (optional)' : ''}\n`
    }
    text += `\nSTEPS\n`
    for (const step of recipe.steps) {
      const dur = step.duration_minutes ? ` [${step.duration_minutes} min]` : ''
      const par = step.parallel ? ' ⚡ parallel' : ''
      text += `${step.step_order}. ${step.instruction}${dur}${par}\n`
    }
    if (recipe.substitutions?.length) {
      text += `\nSUBSTITUTIONS\n`
      for (const s of recipe.substitutions) {
        text += `  ${s.original} → ${s.substitute} (${s.note})\n`
      }
    }
    return text
  }

  const handleCopy = async () => {
    const text = buildPlainText()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div style={{ padding: '80px 1.5rem', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p className="text-small" style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading ticket…</p>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div style={{ padding: '80px 1.5rem', maxWidth: '680px', margin: '0 auto' }}>
        <p style={{ color: 'var(--danger)' }}>⚠️ {error ?? 'Recipe not found'}</p>
        <button className="btn-ghost" style={{ marginTop: '1rem' }} onClick={() => router.push('/')}>Home</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 1.5rem 3rem' }}>
      {/* Action bar — hidden on print */}
      <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} className="btn-ghost">← Back to steps</button>
        <div style={{ flex: 1 }} />
        <button onClick={handleCopy} className="btn-ghost">
          {copied ? '✓ Copied!' : '📋 Copy as text'}
        </button>
        <button onClick={handlePrint} className="btn-primary">🖨 Print</button>
      </div>

      {/* ── TICKET ──────────────────────────────────────────────── */}
      <div id="ticket" className="card print-section" style={{ padding: '2rem' }}>
        {/* Title */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <h1 className="print-title font-apple" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {recipe.name}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <span>👥 Serves {recipe.servings}</span>
            <span>⏱ ~{recipe.time_minutes} min</span>
            {recipe.adapted && <span style={{ color: 'var(--accent)' }}>✓ Adapted</span>}
          </div>
        </div>

        {/* Substitutions */}
        {recipe.substitutions && recipe.substitutions.length > 0 && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(245,167,66,0.06)', border: '1px solid rgba(245,167,66,0.2)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amber)', marginBottom: '0.5rem' }}>
              Substitutions
            </p>
            {recipe.substitutions.map((s, i) => (
              <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {s.original} → {s.substitute} ({s.note})
              </p>
            ))}
          </div>
        )}

        {/* Ingredients */}
        <div className="print-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
            Ingredients
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.375rem' }}>
                <span className="font-mono" style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent)', minWidth: '80px', flexShrink: 0 }}>
                  {ing.quantity}
                </span>
                <span style={{ fontSize: '0.875rem', color: ing.optional ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                  {ing.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="print-section">
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
            Steps
          </h2>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {recipe.steps.map((step) => (
              <li key={step.id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                  marginTop: '1px',
                }}>
                  {step.step_order}
                </span>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: '1.5' }}>
                    {step.instruction}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {step.duration_minutes && step.duration_minutes > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ⏱ {step.duration_minutes} min
                      </span>
                    )}
                    {step.parallel && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 600 }}>
                        ⚡ parallel
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function TicketPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '80px 1.5rem', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    }>
      <TicketContent />
    </Suspense>
  )
}
