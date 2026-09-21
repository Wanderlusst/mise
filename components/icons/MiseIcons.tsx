import React from 'react'

type IconProps = {
  size?: number
  className?: string
  strokeWidth?: number
  filled?: boolean
}

const defaults = { size: 20, className: '', strokeWidth: 1.9 }


export function MiseChefHatIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <path d="M6 13c0-2.8 2.1-5.1 4.8-5.5.5-2.3 2.5-4 5.2-4s4.7 1.7 5.2 4c2.7.4 4.8 2.7 4.8 5.5" />
      <path d="M6 13v2.5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V13" />
      <path d="M8 17.5h8" />
    </svg>
  )
}

export function MiseHeartIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
  filled = false,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20.5s-6.5-4.2-8.5-8.2C1.8 8.8 3.6 5.5 6.8 5.2c1.8-.2 3.4.8 4.2 2.3.8-1.5 2.4-2.5 4.2-2.3 3.2.3 5 3.6 3.3 7.1-2 4-8.5 8.2-8.5 8.2Z" />
    </svg>
  )
}

export function MiseClockIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function MiseCheckCircleIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
    </svg>
  )
}

export function MiseSearchIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5L20 20" />
    </svg>
  )
}

export function MiseFlameIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
  filled = false,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 22c4.5-2.5 6.5-6.2 6.5-10.2 0-3.8-2.5-6.5-4.8-8.5-.8 2.2-2.2 3.8-3.7 5.1C8.5 10.5 7 12.5 7 15c0 2.2 1.2 4.3 2.5 5.5-.8-2.5-.2-5 1.5-7.2 1.2 1.5 2.5 2.2 3 4.7.8-1.2 1.2-2.5 1.2-3.8 0 2.8 1.5 5.2 3.8 7.5Z" />
    </svg>
  )
}

export function MiseBookmarkIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
  filled = false,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5V20l-6.5-3.5L5.5 20V6a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  )
}

export function MiseStarIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <path d="M12 3.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.8l5-.7L12 3.5Z" />
    </svg>
  )
}

export function MiseLeafIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <path d="M20 4C14 4 9 7 6 12c-1.5 2.5-2 5.5-1.5 8 2.5.5 5.5 0 8-1.5 5-3 8-8 8-6 0-10-4-12.5-8.5" />
      <path d="M6 12c3 1 6 1 9 0" />
    </svg>
  )
}

export function MiseUtensilsIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <path d="M6 4v8c0 1.1.9 2 2 2h0" />
      <path d="M6 4c0 2.2 1.8 4 4 4" />
      <path d="M10 4v16" />
      <path d="M16 4v5c0 2.2 1.8 4 4 4v11" />
    </svg>
  )
}

export function MiseCookieIcon({
  size = defaults.size,
  className = defaults.className,
  strokeWidth = defaults.strokeWidth,
}: IconProps) {
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
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9" cy="10" r=".8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="9" r=".8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="14" r=".8" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="14.5" r=".8" fill="currentColor" stroke="none" />
    </svg>
  )
}
