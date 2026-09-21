'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function MobileStepsRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const id = searchParams.get('id') || 'rice-comfort-001'
    const title = searchParams.get('title')
    const query = new URLSearchParams()
    if (title) query.set('title', title)
    query.set('servings', '2')

    router.replace(`/steps/${id}?${query.toString()}`)
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-page)] text-stone-500 text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="font-medium">Opening Cooking Mode…</p>
      </div>
    </div>
  )
}

export default function MobileStepsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[var(--bg-page)] text-stone-500 text-sm">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MobileStepsRedirect />
    </Suspense>
  )
}
