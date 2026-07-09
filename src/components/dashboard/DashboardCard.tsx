import { Link } from 'react-router-dom'

interface DashboardCardProps {
  to: string
  title: string
  description: string
  icon: string
}

export function DashboardCard({ to, title, description, icon }: DashboardCardProps) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 rounded-lg border border-gray-200 bg-surface p-4 shadow-sm transition-colors hover:border-primary hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div>
        <h2 className="font-medium text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  )
}
