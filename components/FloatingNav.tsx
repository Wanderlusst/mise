'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, ScanLine, MessageCircle, User } from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'
import React, { useState, useEffect } from 'react'

// ─── Custom Icons Matching the Reference Screenshot ──────────────────────────

// 1. Home: Peaked roof with rounded corners + vertical stencil cutout notch
function HomeIcon({
  isActive,
  size = 23,
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
        {/* Peaked rounded house with a true cutout notch via evenodd fill */}
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

// 2. Saved: Bookmark (Solid filled when active, clean outline when inactive)
function SavedIcon({
  isActive,
  size = 22,
  className = '',
}: {
  isActive: boolean
  size?: number
  className?: string
}) {
  return (
    <Bookmark
      size={size}
      fill={isActive ? 'currentColor' : 'none'}
      strokeWidth={isActive ? 1.5 : 1.9}
      className={className}
    />
  )
}

// 3. Scan: Scanner lens with target line
function ScanIcon({
  isActive,
  size = 22,
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

// 4. Ask: AI Chef chat bubble
function AskIcon({
  isActive,
  size = 22,
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

// 5. Profile: User outline (matches 4th icon in screenshot)
function ProfileIcon({
  isActive,
  size = 22,
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

// ─── Navigation Items ─────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'home',    label: 'Home',    href: '/mobile',          icon: HomeIcon    },
  { id: 'saved',   label: 'Saved',   href: '/mobile/saved',    icon: SavedIcon   },
  { id: 'scan',    label: 'Scan',    href: '/mobile/scan',     icon: ScanIcon    },
  { id: 'ask',     label: 'Ask',     href: '/mobile/chat',     icon: AskIcon     },
  { id: 'profile', label: 'Profile', href: '/mobile/settings', icon: ProfileIcon },
]

// ─── Spring Config for Organic Animation ─────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 450, damping: 32 } as const

// ─── Route to Tab ID Resolver ─────────────────────────────────────────────────
function resolveActiveId(pathname: string): string {
  const cleanPath = pathname.replace(/\/$/, '')
  if (cleanPath === '/mobile/saved')                                             return 'saved'
  if (cleanPath === '/mobile/scan' || cleanPath.startsWith('/mobile/recipe-result')) return 'scan'
  if (cleanPath === '/mobile/chat' || cleanPath === '/mobile/ask')               return 'ask'
  if (cleanPath === '/mobile/settings' || cleanPath === '/mobile/profile')       return 'profile'
  if (cleanPath.startsWith('/mobile/detail'))                                    return 'home'
  if (cleanPath === '/mobile')                                                   return 'home'
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
      className="relative flex-1 h-full flex flex-col items-center justify-center outline-none focus:outline-none select-none z-10"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* ── Tab Content: Icon & Conditional Label ── */}
      <motion.div
        animate={{
          y: isActive ? -1 : 0,
          scale: isActive ? 1.04 : 1,
        }}
        whileTap={{ scale: 0.88 }}
        transition={SPRING}
        className="flex flex-col items-center justify-center pointer-events-none"
      >
        <Icon
          isActive={isActive}
          size={23}
          className={`transition-colors duration-200 ${
            isActive
              ? 'text-[#2563eb] dark:text-[#60a5fa]'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        />

        {/* ── Active Label (Only active tab shows text, matching screenshot) ── */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, y: 3, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.9 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="text-[11px] font-semibold tracking-tight text-[#2563eb] dark:text-[#60a5fa] mt-1 leading-none select-none"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}

// ─── BottomNavigation (exported alias) ────────────────────────────────────────
export function BottomNavigation() {
  return <FloatingNav />
}

// ─── Main Export: Fixed Bottom Sheet Navigation Bar ──────────────────────────
export function FloatingNav() {
  const pathname = usePathname()
  const haptic = useHaptic()
  const { settings } = useSettings()
  const isDark = settings.theme === 'dark'

  // Immediate local active state for 0ms instant feedback on tap
  const [activeId, setActiveId] = useState<string>(() => resolveActiveId(pathname))
  const [navHidden, setNavHidden] = useState(false)

  useEffect(() => {
    setActiveId(resolveActiveId(pathname))
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

  const handleClick = (item: NavItem, _e: React.MouseEvent<HTMLAnchorElement>) => {
    haptic(10)
    setActiveId(item.id)
  }

  if (navHidden) {
    return null
  }

  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((item) => item.id === activeId))
  const stepPercent = 100 / NAV_ITEMS.length
  const indicatorWidth = 38
  const halfWidth = indicatorWidth / 2

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ ...SPRING, stiffness: 360, damping: 28 }}
        aria-label="Main navigation"
        role="navigation"
        className="pointer-events-auto relative flex items-center justify-between
                   w-full max-w-mobile
                   bg-white dark:bg-[#1c1c1e]
                   rounded-t-[24px] sm:rounded-t-[28px]
                   border-t border-stone-200/90 dark:border-white/10
                   shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_28px_rgba(0,0,0,0.45)]
                   select-none transition-colors duration-200 overflow-hidden"
        style={{
          paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="relative w-full h-[64px] px-4 sm:px-5">
          <div className="relative flex items-center justify-between w-full h-full">
            {/* ── Active Top Indicator Line (Smoothly Slides & Always Mathematically Centered) ── */}
            <motion.div
              className="absolute top-0 h-[3px] rounded-full bg-[#2563eb] dark:bg-[#60a5fa] z-20 pointer-events-none"
              style={{ width: `${indicatorWidth}px` }}
              initial={false}
              animate={{
                left: `calc(${(activeIndex + 0.5) * stepPercent}% - ${halfWidth}px)`,
              }}
              transition={SPRING}
            />

            {NAV_ITEMS.map((item) => (
              <TabItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onClick={(e) => handleClick(item, e)}
              />
            ))}
          </div>
        </div>
      </motion.nav>
    </div>
  )
}
