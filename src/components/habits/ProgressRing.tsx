import type { ReactNode } from 'react'

interface ProgressRingProps {
  percent: number
  completed: number
  total: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'default' | 'light'
  center?: 'stats' | 'custom'
  children?: ReactNode
}

const SIZE_CONFIG = {
  sm: { radius: 36, stroke: 7 },
  md: { radius: 52, stroke: 10 },
  lg: { radius: 50, stroke: 9 },
  xl: { radius: 76, stroke: 11 },
} as const

export function ProgressRing({
  percent,
  completed,
  total,
  size = 'md',
  tone = 'default',
  center = 'stats',
  children,
}: ProgressRingProps) {
  const { radius, stroke } = SIZE_CONFIG[size]
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percent / 100) * circumference
  const isLight = tone === 'light'

  const fractionClass =
    size === 'sm'
      ? 'progress-ring__fraction progress-ring__fraction--sm'
      : size === 'lg' || size === 'xl'
        ? 'progress-ring__fraction progress-ring__fraction--lg'
        : 'progress-ring__fraction'

  const percentClass =
    size === 'sm'
      ? 'progress-ring__percent'
      : 'progress-ring__percent progress-ring__percent--md'

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      role="img"
      aria-label={`${completed} of ${total} habits completed, ${percent} percent`}
    >
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="currentColor"
          className={isLight ? 'text-white/25' : 'text-gray-200 dark:text-gray-700'}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          className={
            isLight
              ? 'text-[#b8e6c8] transition-[stroke-dashoffset] duration-300'
              : 'text-primary transition-[stroke-dashoffset] duration-300'
          }
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {center === 'custom' && children ? (
          children
        ) : (
          <>
            <p
              className={`${fractionClass} ${isLight ? 'text-white' : 'text-[#1b4332] dark:text-[#d8f3dc]'}`}
            >
              {completed}/{total}
            </p>
            <p
              className={`${percentClass} ${isLight ? 'text-white/75' : 'text-[#6b7c72] dark:text-[#a7b0a9]'}`}
            >
              {percent}%
            </p>
          </>
        )}
      </div>
    </div>
  )
}
