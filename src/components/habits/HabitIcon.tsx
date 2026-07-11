import { isHabitIconImage } from '../../utils/habitIcon'

interface HabitIconProps {
  icon: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASS = {
  sm: 'habit-icon--sm',
  md: 'habit-icon--md',
  lg: 'habit-icon--lg',
} as const

export function HabitIcon({ icon, size = 'md', className = '' }: HabitIconProps) {
  const sizeClass = SIZE_CLASS[size]

  if (isHabitIconImage(icon)) {
    return (
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className={`habit-icon habit-icon--image ${sizeClass} ${className}`.trim()}
      />
    )
  }

  return (
    <span aria-hidden="true" className={`habit-icon ${sizeClass} ${className}`.trim()}>
      {icon}
    </span>
  )
}
