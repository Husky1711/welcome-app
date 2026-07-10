interface ProgressRingProps {
  percent: number
  completed: number
  total: number
  size?: 'sm' | 'md'
}

const SIZE_CONFIG = {
  sm: { radius: 36, stroke: 7, fractionClass: 'text-lg', percentClass: 'text-[10px]' },
  md: { radius: 52, stroke: 10, fractionClass: 'text-2xl', percentClass: 'text-xs' },
} as const

export function ProgressRing({
  percent,
  completed,
  total,
  size = 'md',
}: ProgressRingProps) {
  const { radius, stroke, fractionClass, percentClass } = SIZE_CONFIG[size]
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`${completed} of ${total} habits completed, ${percent} percent`}
    >
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="currentColor"
          className="text-gray-200 dark:text-gray-700"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          className="text-primary transition-[stroke-dashoffset] duration-300"
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

      <div className="absolute text-center">
        <p className={`${fractionClass} font-semibold text-gray-900 dark:text-gray-100`}>
          {completed}/{total}
        </p>
        <p className={`${percentClass} text-gray-500 dark:text-gray-400`}>{percent}%</p>
      </div>
    </div>
  )
}
