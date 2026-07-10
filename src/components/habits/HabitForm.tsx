import { useState, type FormEvent } from 'react'
import { HABIT_ICON_OPTIONS } from '../../constants/habits'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface HabitFormProps {
  initialTitle?: string
  initialIcon?: string
  submitLabel: string
  onSubmit: (title: string, icon: string) => void
  onCancel?: () => void
}

export function HabitForm({
  initialTitle = '',
  initialIcon = '✅',
  submitLabel,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [icon, setIcon] = useState(initialIcon)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Please enter a habit name.')
      return
    }

    setError(null)
    onSubmit(trimmedTitle, icon)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Habit name"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Drink 8 glasses of water"
        maxLength={60}
      />

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Icon
        </legend>
        <div className="flex flex-wrap gap-2">
          {HABIT_ICON_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setIcon(option)}
              aria-pressed={icon === option}
              aria-label={`Select ${option} icon`}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition ${
                icon === option
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-primary/40 dark:border-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" fullWidth>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
