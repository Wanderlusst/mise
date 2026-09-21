import type { Metadata } from 'next'
import { FloatingNav } from '@/components/FloatingNav'

export const metadata: Metadata = {
  title: 'Cookbook & Smart Kitchen Hub',
  description:
    'Explore instant pantry matches, active cooking sessions, and personalized chef picks based on ingredients you have right now.',
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
