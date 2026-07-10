import { useState, type FormEvent } from 'react'
import { DEFAULT_REMINDER_TIME, HABIT_ICON_OPTIONS } from '../../constants/habits'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export interface HabitFormValues {
  title: string
  icon: string
  reminderEnabled: boolean
  reminderTime: string
}

interface HabitFormProps {
  initialTitle?: string
  initialIcon?: string
  initialReminderEnabled?: boolean
  initialReminderTime?: string
  submitLabel: string
  onSubmit: (values: HabitFormValues) => void
  onCancel?: () => void
}

export function HabitForm({
  initialTitle = '',
  initialIcon = '✅',
  initialReminderEnabled = false,
  initialReminderTime = DEFAULT_REMINDER_TIME,
  submitLabel,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [icon, setIcon] = useState(initialIcon)
  const [reminderEnabled, setReminderEnabled] = useState(initialReminderEnabled)
  const [reminderTime, setReminderTime] = useState(initialReminderTime)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Please enter a habit name.')
      return
    }

    setError(null)
    onSubmit({
      title: trimmedTitle,
      icon,
      reminderEnabled,
      reminderTime,
    })
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

      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(event) => setReminderEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Daily reminder
          </span>
        </label>

        {reminderEnabled ? (
          <div className="mt-3">
            <label
              htmlFor="habit-reminder-time"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Reminder time
            </label>
            <input
              id="habit-reminder-time"
              name="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-surface px-3 py-2.5 text-sm text-gray-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary dark:border-gray-600 dark:text-gray-100"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              On Android, you will be asked to allow notifications the first time you enable a
              reminder.
            </p>
          </div>
        ) : null}
      </div>

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
