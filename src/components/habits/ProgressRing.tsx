interface ProgressRingProps {
  percent: number
  completed: number
  total: number
}

export function ProgressRing({ percent, completed, total }: ProgressRingProps) {
  const radius = 52
  const stroke = 10
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
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {completed}/{total}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{percent}%</p>
      </div>
    </div>
  )
}
