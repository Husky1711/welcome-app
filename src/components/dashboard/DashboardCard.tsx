import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface DashboardCardProps {
  to: string
  title: string
  description: string
  icon: ReactNode
}

export function DashboardCard({ to, title, description, icon }: DashboardCardProps) {
  return (
    <Link to={to} className="feature-card">
      <span className="feature-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h2 className="feature-card__title">{title}</h2>
        <p className="feature-card__desc">{description}</p>
      </div>
    </Link>
  )
}
