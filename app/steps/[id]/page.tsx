'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  diet: string
  time_minutes: number
  servings: number
  ingredients: Ingredient[]
  steps: RecipeStep[]
  adapted: boolean
  adaptationReason?: string
  substitutions?: Array<{ original: string; substitute: string; note: string }>
}

// ── Countdown Timer component ───────────────────────────────────────
function StepTimer({ durationMinutes, isActive }: { durationMinutes: number; isActive: boolean }) {
  const totalSeconds = durationMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { clear(); setRunning(false); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      clear()
    }
    return clear
  }, [running, clear, secondsLeft])

  const reset = () => {
    clear()
    setRunning(false)
    setSecondsLeft(totalSeconds)
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const isUrgent = secondsLeft <= 30 && secondsLeft > 0
  const isDone = secondsLeft === 0

  return (
    <div>
      {/* Pulse animation only when urgent (< 30s) — status signal */}
      <motion.div
        className={`timer-display font-mono tabular-nums ${isUrgent ? 'urgent' : ''}`}
        animate={isUrgent && running
          ? { opacity: [1, 0.45, 1] }
          : { opacity: 1 }}
        transition={isUrgent && running
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.2 }}
      >
        {isDone ? '✓ Done' : timeStr}
      </motion.div>
      <div className="timer-btn-group">
        <button
          className={`timer-btn start`}
          onClick={() => setRunning(!running)}
          disabled={isDone}
          aria-label={running ? 'Pause timer' : 'Start timer'}
        >
          {running ? '⏸ Pause' : isDone ? 'Done' : '▶ Start'}
        </button>
        <button className="timer-btn" onClick={reset} aria-label="Reset timer">
          ↺ Reset
        </button>
      </div>
    </div>
  )
}

// ── Single step card ────────────────────────────────────────────────
function StepCard({
  step,
  index,
  total,
  isActive,
  isDone,
  onClick,
}: {
  step: RecipeStep
  index: number
  total: number
  isActive: boolean
  isDone: boolean
  onClick: () => void
}) {
  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        borderColor: isActive ? 'var(--border-accent)' : isDone ? 'rgba(255,255,255,0.04)' : 'var(--border)',
        opacity: isDone ? 0.6 : 1,
        transition: 'opacity 0.2s, border-color 0.2s',
        cursor: 'pointer',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Step ${index + 1}: ${step.instruction}`}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Step number */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isActive ? 'var(--accent)' : isDone ? 'var(--text-muted)' : 'var(--bg-surface)',
          border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: isActive ? '#0d1a15' : isDone ? '#0d1a15' : 'var(--text-muted)',
          transition: 'all 0.2s',
        }}>
          {isDone ? '✓' : index + 1}
        </div>

        <div style={{ flex: 1 }}>
          <p className="text-body" style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {step.instruction}
          </p>

          {step.duration_minutes !== null && step.duration_minutes !== undefined && step.duration_minutes > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-muted">⏱ {step.duration_minutes} min</span>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <StepTimer durationMinutes={step.duration_minutes} isActive={isActive} />
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Group consecutive parallel steps ───────────────────────────────
function groupSteps(steps: RecipeStep[]): Array<RecipeStep | RecipeStep[]> {
  const groups: Array<RecipeStep | RecipeStep[]> = []
  let i = 0
  while (i < steps.length) {
    if (steps[i].parallel) {
      const group: RecipeStep[] = [steps[i]]
      while (i + 1 < steps.length && steps[i + 1].parallel) {
        i++
        group.push(steps[i])
      }
      groups.push(group)
    } else {
      groups.push(steps[i])
    }
    i++
  }
  return groups
}

function StepsContent() {
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
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set())

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
        if (!res.ok) throw new Error(data.error ?? 'Failed to adapt recipe')
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

  const markDone = (stepIndex: number) => {
    setDoneSteps((prev) => new Set(Array.from(prev).concat(stepIndex)))
    if (stepIndex === activeStepIndex && recipe) {
      setActiveStepIndex(Math.min(activeStepIndex + 1, recipe.steps.length - 1))
    }
  }

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '6rem', gap: '1rem' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Adapting your recipe…</p>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="page-container">
        <div className="card" style={{ padding: '2rem', borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>⚠️ {error ?? 'Recipe not found'}</p>
          <button className="btn-ghost" style={{ marginTop: '1rem' }} onClick={() => router.push('/')}>Home</button>
        </div>
      </div>
    )
  }

  const groups = groupSteps(recipe.steps)
  const allDone = doneSteps.size === recipe.steps.length

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} className="btn-ghost no-print" style={{ marginBottom: '1.25rem' }}>
          ← Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="text-headline font-serif" style={{ marginBottom: '0.5rem' }}>{recipe.name}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-muted">⏱ {recipe.time_minutes} min</span>
              <span className="badge badge-muted">👥 {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span>
              {!recipe.adapted && (
                <span className="badge badge-amber" title={recipe.adaptationReason}>
                  ⚠ Original recipe
                </span>
              )}
              {recipe.adapted && <span className="badge badge-accent">✓ Adapted</span>}
            </div>
          </div>
          <button
            className="btn-ghost no-print"
            onClick={() => router.push(`/ticket/${recipeId}?ingredients=${encodeURIComponent(ingredientsParam)}&servings=${servings}`)}
          >
            🎫 View Ticket
          </button>
        </div>

        {/* Substitutions */}
        {recipe.substitutions && recipe.substitutions.length > 0 && (
          <div className="card" style={{ marginTop: '1rem', padding: '1rem 1.25rem', borderColor: 'var(--amber-dim)', background: 'rgba(245,167,66,0.04)' }}>
            <p className="text-label" style={{ color: 'var(--amber)', marginBottom: '0.5rem' }}>Substitutions used</p>
            {recipe.substitutions.map((s, i) => (
              <p key={i} className="text-small" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{s.original}</span>
                {' → '}
                <span style={{ color: 'var(--amber)' }}>{s.substitute}</span>
                {s.note && <span style={{ color: 'var(--text-muted)' }}> ({s.note})</span>}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients sidebar row */}
      <details style={{ marginBottom: '2rem' }}>
        <summary className="btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex', marginBottom: '0.75rem' }}>
          📋 Ingredients ({recipe.ingredients.length})
        </summary>
        <div className="card" style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                <span className="text-small" style={{ color: 'var(--accent)', fontWeight: 600, minWidth: '80px' }}>
                  {ing.quantity}
                </span>
                <span className="text-small" style={{ color: ing.optional ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                  {ing.name}{ing.optional ? ' (opt.)' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* Steps timeline */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '28px',
          bottom: '28px',
          width: '1px',
          background: 'var(--border)',
          zIndex: 0,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
          {groups.map((group, gIdx) => {
            if (Array.isArray(group)) {
              // ── Parallel group ──────────────────────────────
              return (
                <div key={gIdx} style={{ paddingLeft: '2.5rem' }}>
                  <div className="parallel-group">
                    <div className="parallel-label">⚡ Parallel steps — do these at the same time</div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {group.map((step, pIdx) => {
                        const globalIdx = recipe.steps.findIndex((s) => s.id === step.id)
                        return (
                          <div key={step.id} style={{ flex: '1 1 250px' }}>
                            <StepCard
                              step={step}
                              index={globalIdx}
                              total={recipe.steps.length}
                              isActive={activeStepIndex === globalIdx}
                              isDone={doneSteps.has(globalIdx)}
                              onClick={() => {
                                if (doneSteps.has(globalIdx)) {
                                  setDoneSteps((prev) => { const n = new Set(Array.from(prev)); n.delete(globalIdx); return n })
                                } else {
                                  markDone(globalIdx)
                                }
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            }

            // ── Single step ─────────────────────────────────
            const globalIdx = recipe.steps.findIndex((s) => s.id === group.id)
            return (
              <div key={group.id} style={{ display: 'flex', gap: '0', alignItems: 'flex-start' }}>
                {/* dot + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                  <div className={`step-dot ${activeStepIndex === globalIdx ? 'active' : doneSteps.has(globalIdx) ? 'done' : ''}`}
                    style={{ marginTop: '14px', width: '10px', height: '10px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <StepCard
                    step={group}
                    index={globalIdx}
                    total={recipe.steps.length}
                    isActive={activeStepIndex === globalIdx}
                    isDone={doneSteps.has(globalIdx)}
                    onClick={() => {
                      if (doneSteps.has(globalIdx)) {
                        setDoneSteps((prev) => { const n = new Set(Array.from(prev)); n.delete(globalIdx); return n })
                      } else {
                        setActiveStepIndex(globalIdx)
                        markDone(globalIdx)
                      }
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* All done CTA */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card card-glow"
            style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 className="text-title" style={{ marginBottom: '0.5rem' }}>All done! Enjoy your {recipe.name}.</h2>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <button className="btn-primary" onClick={() => router.push(`/ticket/${recipeId}?ingredients=${encodeURIComponent(ingredientsParam)}&servings=${servings}`)}>
                🎫 Save Ticket
              </button>
              <button className="btn-ghost" onClick={() => router.push('/')}>Cook another</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function StepsPage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}>
        <div className="spinner" />
      </div>
    }>
      <StepsContent />
    </Suspense>
  )
}
