import type { Metadata } from 'next'
import { FloatingNav } from '@/components/FloatingNav'

export const metadata: Metadata = {
  title: 'Mise',
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Fixed gradient background — behind everything */}
      <div className="mise-bg" aria-hidden="true" />

      {/* Single mobile shell, max 430px centered */}
      <div className="mobile-shell">
        {children}
      </div>

      {/* Floating nav sits outside shell so it positions against viewport */}
      <FloatingNav />
    </>
  )
}
