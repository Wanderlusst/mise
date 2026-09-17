'use client'

import { motion, LayoutGroup } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, ScanLine, MessageCircle, Settings } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import React, { useState, useEffect } from 'react'

// ─── Custom House Icon (Matches Reference Screenshot with Cute Inner Smile) ───
function HomeSmileIcon({
  size = 23,
  strokeWidth = 2.2,
  className = '',
  style = {},
}: {
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Peaked roof with rounded peak and base walls */}
      <path d="M4.5 11.2 L12 4.2 L19.5 11.2 V19 C19.5 20.1 18.6 21 17.5 21 H6.5 C5.4 21 4.5 20.1 4.5 19 Z" />
      {/* Cute inner smile curve matching the reference */}
      <path d="M10.2 16.2 C10.8 17.4 13.2 17.4 13.8 16.2" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
}

// ─── Nav Items (Home, Saved, Scan, Ask, Settings) ─────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'home',     label: 'Home',     href: '/mobile',          icon: HomeSmileIcon },
  { id: 'saved',    label: 'Saved',    href: '/mobile/saved',    icon: Bookmark      },
  { id: 'scan',     label: 'Scan',     href: '/mobile/scan',     icon: ScanLine      },
  { id: 'ask',      label: 'Ask',      href: '/mobile/chat',     icon: MessageCircle },
  { id: 'settings', label: 'Settings', href: '/mobile/settings', icon: Settings      },
]

// ─── Spring Config for Buttery Smooth Morphing ────────────────────────────────
const SPRING = { type: 'spring', stiffness: 480, damping: 34, mass: 0.8 } as const

// ─── Route to Tab ID Resolver ─────────────────────────────────────────────────
function resolveActiveId(pathname: string): string {
  const cleanPath = pathname.replace(/\/$/, '')
  if (cleanPath === '/mobile/saved')                               return 'saved'
  if (cleanPath === '/mobile/scan')                                return 'scan'
  if (cleanPath === '/mobile/chat' || cleanPath === '/mobile/ask') return 'ask'
  if (cleanPath === '/mobile/settings')                            return 'settings'
  if (cleanPath.startsWith('/mobile/detail'))                      return 'home'
  if (cleanPath === '/mobile')                                     return 'home'
  return 'home'
}

// ─── Single Tab Item ──────────────────────────────────────────────────────────
interface TabItemProps {
  item: NavItem
  isActive: boolean
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

function TabItem({ item, isActive, onClick }: TabItemProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      id={`nav-${item.id}`}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className="relative flex-1 h-full flex items-center justify-center outline-none focus:outline-none select-none z-10"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* ── Active Sliding Capsule Pill (Exact Recreation of Reference Screenshot) ── */}
      {isActive && (
        <motion.div
          layoutId="activeFloatingPill"
          transition={SPRING}
          className="absolute inset-y-1.5 inset-x-1.5 rounded-full pointer-events-none overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: [
              '0 4px 16px -2px rgba(0, 0, 0, 0.07)',
              '0 1px 4px rgba(0, 0, 0, 0.03)',
              'inset 0 1.5px 1.5px rgba(255, 255, 255, 1)',
              'inset 0 -1px 1px rgba(0, 0, 0, 0.03)',
            ].join(', '),
          }}
        >
          {/* Prismatic edge refraction: Mint Green (top-left) -> Peach (mid-left) -> Sky Blue (bottom-left) */}
          <div
            className="absolute -left-1.5 -top-1.5 w-8 h-[130%] rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(135, 245, 195, 0.75) 0%, rgba(255, 210, 150, 0.65) 45%, rgba(135, 215, 255, 0.7) 100%)',
              filter: 'blur(5px)',
              opacity: 0.9,
            }}
          />

          {/* Crisp glass rim highlight border */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.88)',
              boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 0.95)',
            }}
          />

          {/* Subtle iridescent reflection on curved corner */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-40"
            style={{
              background:
                'radial-gradient(circle at 10% 25%, rgba(135, 245, 195, 0.8) 0%, transparent 45%), radial-gradient(circle at 12% 80%, rgba(135, 215, 255, 0.7) 0%, transparent 45%)',
            }}
          />
        </motion.div>
      )}

      {/* ── Icon with Spring Micro-interaction ── */}
      <motion.div
        animate={{
          scale: isActive ? 1.12 : 1,
          y: isActive ? -0.5 : 0,
        }}
        whileTap={{ scale: 0.84 }}
        transition={SPRING}
        className="relative z-20 flex items-center justify-center pointer-events-none"
      >
        <Icon
          size={23}
          strokeWidth={isActive ? 2.3 : 1.85}
          className="transition-colors duration-200"
          style={{
            color: isActive ? '#18181b' : 'rgba(0, 0, 0, 0.40)',
            filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))' : 'none',
          }}
        />
      </motion.div>
    </Link>
  )
}

// ─── BottomNavigation (exported alias) ────────────────────────────────────────
export function BottomNavigation() {
  return <FloatingNav />
}

// ─── Main Export: Floating Glass Pill Navigation Bar ──────────────────────────
export function FloatingNav() {
  const pathname = usePathname()
  const haptic   = useHaptic()

  // Immediate local active state for 0ms instant feedback on tap
  const [activeId, setActiveId] = useState<string>(() => resolveActiveId(pathname))

  useEffect(() => {
    setActiveId(resolveActiveId(pathname))
  }, [pathname])

  const handleClick = (item: NavItem, _e: React.MouseEvent<HTMLAnchorElement>) => {
    haptic(10)
    setActiveId(item.id)
  }

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center pointer-events-none px-4"
      style={{
        bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))',
      }}
    >
      <motion.nav
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ ...SPRING, stiffness: 360, damping: 28 }}
        aria-label="Main navigation"
        role="navigation"
        className="pointer-events-auto relative flex items-center justify-between
                   h-[62px] w-full max-w-[348px] p-1.5
                   rounded-full select-none"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: [
            '0 20px 48px -10px rgba(0, 0, 0, 0.12)',
            '0 6px 18px -4px rgba(0, 0, 0, 0.05)',
            'inset 0 1px 1.5px rgba(255, 255, 255, 0.95)',
          ].join(', '),
        }}
      >
        <LayoutGroup id="floating-pill-nav">
          <div className="flex items-center justify-between w-full h-full relative">
            {NAV_ITEMS.map((item) => (
              <TabItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onClick={(e) => handleClick(item, e)}
              />
            ))}
          </div>
        </LayoutGroup>
      </motion.nav>
    </div>
  )
}
