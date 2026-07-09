import { Link } from 'react-router-dom'

interface AppHeaderProps {
  title: string
  backTo?: string
}

export function AppHeader({ title, backTo }: AppHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-surface px-4 py-4 dark:border-gray-700">
      <div className="mx-auto flex w-full max-w-md items-center gap-3">
        {backTo ? (
          <Link
            to={backTo}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-sm font-medium text-primary hover:bg-blue-50 dark:hover:bg-gray-800"
            aria-label="Go back"
          >
            ←
          </Link>
        ) : null}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>
    </header>
  )
}
