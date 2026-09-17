'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

interface PetalData {
  label: string
  value: number   // 0–100
  color?: string
}

interface PetalChartProps {
  data: PetalData[]
  centerImage?: string
  centerLabel?: string
  size?: number
  className?: string
}

// Palette cycling for petals
const PETAL_COLORS = [
  '#8A9B64', // olive-400
  '#D9A441', // saffron-400
  '#6E7F4A', // olive-500
  '#E8BC6A', // saffron-300
  '#A8B882', // olive-300
  '#5C6B3D', // olive-600
]

export function PetalChart({
  data,
  centerImage,
  centerLabel,
  size = 280,
  className,
}: PetalChartProps) {
  const cx = size / 2
  const cy = size / 2
  const maxPetalLength = size * 0.34
  const minPetalLength = size * 0.12
  const petalWidth = size * 0.18
  const centerRadius = size * 0.18

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const normalized = data.map((d) => ({
    ...d,
    pct: total > 0 ? d.value / total : 1 / data.length,
  }))

  const angleStep = (2 * Math.PI) / data.length
  const startAngle = -Math.PI / 2  // start from top

  return (
    <div className={cn('relative select-none', className)} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible"
        aria-label="Ingredient breakdown chart"
      >
        {normalized.map((item, i) => {
          const angle = startAngle + i * angleStep
          const petalLength = minPetalLength + item.pct * (maxPetalLength - minPetalLength) * 2.5
          const clampedLength = Math.min(petalLength, maxPetalLength)

          // Petal center point
          const px = cx + Math.cos(angle) * (centerRadius + clampedLength / 2)
          const py = cy + Math.sin(angle) * (centerRadius + clampedLength / 2)

          // Perpendicular axis for petal width
          const perpX = -Math.sin(angle)
          const perpY = Math.cos(angle)

          const hw = petalWidth * item.pct * 4
          const clampedHW = Math.min(hw, petalWidth)

          // Petal path: ellipse-like bezier
          const inX = cx + Math.cos(angle) * centerRadius
          const inY = cy + Math.sin(angle) * centerRadius
          const tipX = cx + Math.cos(angle) * (centerRadius + clampedLength)
          const tipY = cy + Math.sin(angle) * (centerRadius + clampedLength)

          const cp1x = inX + perpX * clampedHW
          const cp1y = inY + perpY * clampedHW
          const cp2x = tipX + perpX * (clampedHW * 0.5)
          const cp2y = tipY + perpY * (clampedHW * 0.5)
          const cp3x = tipX - perpX * (clampedHW * 0.5)
          const cp3y = tipY - perpY * (clampedHW * 0.5)
          const cp4x = inX - perpX * clampedHW
          const cp4y = inY - perpY * clampedHW

          const pathD = `
            M ${inX} ${inY}
            C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tipX} ${tipY}
            C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${inX} ${inY}
            Z
          `

          const color = item.color ?? PETAL_COLORS[i % PETAL_COLORS.length]

          // Label position
          const labelDist = centerRadius + clampedLength + size * 0.06
          const lx = cx + Math.cos(angle) * labelDist
          const ly = cy + Math.sin(angle) * labelDist

          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 22,
                delay: i * 0.05,
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <path
                d={pathD}
                fill={color}
                fillOpacity={0.82}
              />

              {/* Label group */}
              <text
                x={lx}
                y={ly - 7}
                textAnchor="middle"
                fill="#3E4A2A"
                fontSize={size * 0.046}
                fontWeight="600"
                fontFamily="ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace"
                className="tabular-nums"
              >
                {Math.round(item.pct * 100)}%
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor="middle"
                fill="#6E7F4A"
                fontSize={size * 0.038}
                fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif"
              >
                {item.label}
              </text>
            </motion.g>
          )
        })}

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={centerRadius} fill="white" opacity={0.95} />
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
        <defs>
          <clipPath id="centerClip">
            <circle cx={cx} cy={cy} r={centerRadius} />
          </clipPath>
        </defs>
        {!centerImage && centerLabel && (
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fill="#3E4A2A"
            fontSize={size * 0.048}
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            {centerLabel}
          </text>
        )}
      </svg>
    </div>
  )
}
