'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScanLine, MessageCircle, User } from 'lucide-react'
import { MiseBookmarkIcon } from '@/components/icons/MiseIcons'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'
import React, { useState, useEffect } from 'react'

// ─── Custom Icons ─────────────────────────────────────────────────────────────

function HomeIcon({
  isActive,
  size = 22,
  className = '',
}: {
  isActive: boolean
  size?: number
  className?: string
}) {
  if (isActive) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.12 2.82a1.36 1.36 0 0 1 1.76 0l7.25 5.8c.55.44.87 1.11.87 1.82V18.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-8.06c0-.71.32-1.38.87-1.82l7.25-5.8ZM12 12.6a1.1 1.1 0 0 0-1.1 1.1v3.2a1.1 1.1 0 1 0 2.2 0v-3.2A1.1 1.1 0 0 0 12 12.6Z"
        />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11.12 2.82a1.36 1.36 0 0 1 1.76 0l7.25 5.8c.55.44.87 1.11.87 1.82V18.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-8.06c0-.71.32-1.38.87-1.82l7.25-5.8Z" />
    </svg>
  )
}

function SavedIcon({
  isActive,
  size = 21,
  className = '',
}: {
  isActive: boolean
  size?: number
  className?: string
}) {
  return (
    <MiseBookmarkIcon
      size={size}
      filled={isActive}
      strokeWidth={isActive ? 1.6 : 1.9}
      className={className}
    />
  )
}

function ScanIcon({
  isActive,
  size = 21,
  className = '',
}: {
  isActive: boolean
  size?: number
  className?: string
}) {
  return (
    <ScanLine
      size={size}
      strokeWidth={isActive ? 2.3 : 1.9}
      className={className}
    />
  )
}

function AskIcon({
  isActive,
  size = 21,
  className = '',
}: {
  isActive: boolean
  size?: number
  className?: string
}) {
  return (
    <MessageCircle
      size={size}
      fill={isActive ? 'currentColor' : 'none'}
      strokeWidth={isActive ? 1.5 : 1.9}
      className={className}
    />
  )
}

function ProfileIcon({
  isActive,
  size = 21,
  className = '',
}: {
  isActive: boolean
  size?: number
  className?: string
}) {
  return (
    <User
      size={size}
      fill={isActive ? 'currentColor' : 'none'}
      strokeWidth={isActive ? 1.5 : 1.9}
      className={className}
    />
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ isActive: boolean; size?: number; className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '/mobile', icon: HomeIcon },
  { id: 'saved', label: 'Saved', href: '/mobile/saved', icon: SavedIcon },
  { id: 'scan', label: 'Scan', href: '/mobile/scan', icon: ScanIcon },
  { id: 'ask', label: 'Ask', href: '/mobile/chat', icon: AskIcon },
  { id: 'profile', label: 'Profile', href: '/mobile/settings', icon: ProfileIcon },
]

const DOCK_TRANSITION = { type: 'tween', duration: 0.22, ease: [0.4, 0, 0.2, 1] } as const

function resolveActiveId(pathname: string): string {
  const cleanPath = pathname.replace(/\/$/, '')
  if (cleanPath === '/mobile/saved') return 'saved'
  if (cleanPath === '/mobile/scan' || cleanPath.startsWith('/mobile/recipe-result')) return 'scan'
  if (cleanPath === '/mobile/chat' || cleanPath === '/mobile/ask') return 'ask'
  if (cleanPath === '/mobile/settings' || cleanPath === '/mobile/profile') return 'profile'
  if (cleanPath.startsWith('/mobile/detail')) return 'home'
  if (cleanPath === '/mobile') return 'home'
  return 'home'
}

// ─── Single Tab in Floating Glass Dock ────────────────────────────────────────
interface DockTabProps {
  item: NavItem
  isActive: boolean
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

function DockTab({ item, isActive, onClick }: DockTabProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      id={`nav-${item.id}`}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className="relative flex-1 h-full flex flex-col items-center justify-center outline-none select-none z-10"
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* ── Active Background Pill via Framer Motion Shared Layout ── */}
      {isActive && (
        <motion.div
          layoutId="dockActivePill"
          transition={DOCK_TRANSITION}
          className="absolute inset-y-1.5 inset-x-1 rounded-[20px] pointer-events-none z-0"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)',
          }}
        />
      )}

      {/* Tab Icon & Label */}
      <motion.div
        animate={{
          y: isActive ? -1 : 0,
          scale: isActive ? 1.05 : 1,
        }}
        whileTap={{ scale: 0.88 }}
        transition={DOCK_TRANSITION}
        className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
      >
        <Icon
          isActive={isActive}
          size={21}
          className={`transition-colors duration-200 ${
            isActive
              ? 'text-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        />

        <span
          className={`text-[10px] font-semibold tracking-tight mt-0.5 leading-none transition-colors duration-200 ${
            isActive
              ? 'text-[var(--accent)]'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          {item.label}
        </span>
      </motion.div>
    </Link>
  )
}

// ─── Floating Glassmorphism Dock Navigation ──────────────────────────────────
export function FloatingNav() {
  const pathname = usePathname()
  const haptic = useHaptic()
  const { settings } = useSettings()

  const [activeId, setActiveId] = useState<string>(() => resolveActiveId(pathname))
  const [navHidden, setNavHidden] = useState(false)

  useEffect(() => {
    setActiveId(resolveActiveId(pathname))
    setNavHidden(document.body.classList.contains('hide-nav'))
  }, [pathname])

  useEffect(() => {
    const check = () => {
      setNavHidden(document.body.classList.contains('hide-nav'))
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleClick = (item: NavItem) => {
    haptic(10)
    setActiveId(item.id)
  }

  return (
    <AnimatePresence>
      {!navHidden && (
        <motion.div
          id="floating-bottom-nav"
          data-floating-nav="true"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4"
          style={{
            paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
          }}
        >
          <nav
            aria-label="Main navigation"
            className="pointer-events-auto relative flex items-center justify-between
                       w-full max-w-[390px] h-[64px] px-2
                       rounded-[28px] select-none
                       bg-[var(--bg-card)]
                       border border-[var(--bg-card-border)]
                       shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            {NAV_ITEMS.map((item) => (
              <DockTab
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onClick={() => handleClick(item)}
              />
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function BottomNavigation() {
  return <FloatingNav />
}
