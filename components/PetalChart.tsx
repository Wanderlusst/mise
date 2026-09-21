'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface PetalData {
  label: string
  value: number // 0–100
  color?: string
}

export interface PetalChartProps {
  data: PetalData[]
  centerImage?: string
  centerLabel?: string
  size?: number
  className?: string
  reshuffling?: boolean
}

// Curated harmonious culinary palette for petals using design tokens
const PETAL_COLORS = [
  'var(--accent)',
  'var(--success)',
  'var(--accent-text-on-light)',
  'var(--text-secondary)',
  'var(--bg-banner)',
]

export function PetalChart({
  data,
  centerImage,
  centerLabel,
  size = 280,
  className,
  reshuffling = false,
}: PetalChartProps) {
  const cx = size / 2
  const cy = size / 2
  const maxPetalLength = size * 0.22
  const minPetalLength = size * 0.12
  const petalWidth = size * 0.16
  const centerRadius = size * 0.18

  // Ensure data always has valid values
  const safeData = data.length > 0
    ? data
    : [{ label: 'Fresh Haul', value: 100, color: 'var(--success)' }]

  const total = safeData.reduce((sum, d) => sum + (d.value || 1), 0)
  const normalized = safeData.map((d) => ({
    ...d,
    pct: total > 0 ? (d.value || 1) / total : 1 / safeData.length,
  }))

  const angleStep = (2 * Math.PI) / safeData.length
  const startAngle = -Math.PI / 2 // start from top

  return (
    <div className={cn('relative select-none flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible"
        aria-label="Ingredient breakdown chart"
      >
        <defs>
          <clipPath id="centerClip">
            <circle cx={cx} cy={cy} r={centerRadius} />
          </clipPath>
          <filter id="petalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* ── Petals layer ── */}
        {normalized.map((item, i) => {
          const angle = startAngle + i * angleStep
          const petalLength = minPetalLength + item.pct * (maxPetalLength - minPetalLength) * 2.2
          const clampedLength = Math.min(Math.max(petalLength, minPetalLength), maxPetalLength)

          // Perpendicular axis for petal thickness
          const perpX = -Math.sin(angle)
          const perpY = Math.cos(angle)

          const hw = Math.max(15, Math.min(petalWidth * item.pct * 3.6, petalWidth * 0.72))

          // Bezier control points for organic petal contour
          const inX = cx + Math.cos(angle) * (centerRadius - 2)
          const inY = cy + Math.sin(angle) * (centerRadius - 2)
          const tipX = cx + Math.cos(angle) * (centerRadius + clampedLength)
          const tipY = cy + Math.sin(angle) * (centerRadius + clampedLength)

          const cp1x = inX + perpX * hw
          const cp1y = inY + perpY * hw
          const cp2x = tipX + perpX * (hw * 0.45)
          const cp2y = tipY + perpY * (hw * 0.45)
          const cp3x = tipX - perpX * (hw * 0.45)
          const cp3y = tipY - perpY * (hw * 0.45)
          const cp4x = inX - perpX * hw
          const cp4y = inY - perpY * hw

          const pathD = `
            M ${inX} ${inY}
            C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tipX} ${tipY}
            C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${inX} ${inY}
            Z
          `

          const color = item.color ?? PETAL_COLORS[i % PETAL_COLORS.length]

          // Label placement offset outside petal tip
          const labelDist = centerRadius + clampedLength + Math.max(10, size * 0.045)
          const lx = cx + Math.cos(angle) * labelDist
          const ly = cy + Math.sin(angle) * labelDist

          return (
            <motion.g
              key={`${item.label}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={reshuffling ? { scale: 0.97, opacity: 0.45 } : { scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 24,
                delay: reshuffling ? 0 : i * 0.045,
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              filter="url(#petalGlow)"
            >
              <path
                d={pathD}
                fill={color}
                fillOpacity={0.88}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1}
              />

              {/* Percentage */}
              <text
                x={lx}
                y={ly - 5}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={Math.max(10, size * 0.042)}
                fontWeight="700"
                fontFamily="ui-monospace, 'SF Mono', monospace"
              >
                {Math.round(item.pct * 100)}%
              </text>

              {/* Ingredient label */}
              <text
                x={lx}
                y={ly + 8}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize={Math.max(9, size * 0.034)}
                fontWeight="600"
                fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif"
              >
                {item.label}
              </text>
            </motion.g>
          )
        })}

        {/* ── Center Circle & Recipe Dish Photo ── */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={centerRadius}
          fill="var(--bg-card)"
          stroke="var(--accent)"
          strokeWidth={2}
          animate={reshuffling ? { opacity: [0.75, 1, 0.75] } : { opacity: 1 }}
          transition={reshuffling ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {centerImage && (
          <image
            href={centerImage}
            x={cx - centerRadius}
            y={cy - centerRadius}
            width={centerRadius * 2}
            height={centerRadius * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#centerClip)"
          />
        )}

        {!centerImage && centerLabel && (
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize={size * 0.046}
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {centerLabel}
          </text>
        )}
      </svg>
    </div>
  )
}
