import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { DEFAULT_REMINDER_TIME, HABIT_ICON_OPTIONS } from '../../constants/habits'
import type { TargetPeriod } from '../../types/habit'
import { getSuggestedReminderTime } from '../../utils/reminderTime'
import { HABIT_ICON_OUTPUT_SIZE, isHabitIconImage } from '../../utils/habitIcon'
import { validateImageFile } from '../../utils/imageUpload'
import { BellReminderIcon } from '../icons/NavIcons'
import { CircularImageCropper } from '../ui/CircularImageCropper'
import { HabitIcon } from './HabitIcon'

export interface HabitFormValues {
  title: string
  icon: string
  reminderEnabled: boolean
  reminderTime: string
  period: TargetPeriod
  targetFrequency: number
}

interface HabitFormProps {
  initialTitle?: string
  initialIcon?: string
  initialReminderEnabled?: boolean
  initialReminderTime?: string
  initialPeriod?: TargetPeriod
  initialTargetFrequency?: number
  submitLabel: string
  onSubmit: (values: HabitFormValues) => void
  onCancel?: () => void
}

function UploadIconGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V6.5M12 6.5L9 9.5M12 6.5l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16.5v1.75A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25V16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HabitForm({
  initialTitle = '',
  initialIcon = '✅',
  initialReminderEnabled = false,
  initialReminderTime = DEFAULT_REMINDER_TIME,
  initialPeriod = 'daily',
  initialTargetFrequency = 1,
  submitLabel,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const uploadInputId = useId()
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const isEditing = Boolean(initialTitle)
  const [title, setTitle] = useState(initialTitle)
  const [icon, setIcon] = useState(initialIcon)
  const [period, setPeriod] = useState<TargetPeriod>(initialPeriod)
  const [targetFrequency, setTargetFrequency] = useState(
    initialPeriod === 'weekly' ? Math.min(7, Math.max(1, initialTargetFrequency)) : 1,
  )
  const [reminderEnabled, setReminderEnabled] = useState(initialReminderEnabled)
  const [reminderTime, setReminderTime] = useState(initialReminderTime)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)

  const customIconSelected = isHabitIconImage(icon)

  function closeCropper() {
    if (cropSource?.startsWith('blob:')) {
      URL.revokeObjectURL(cropSource)
    }
    setCropSource(null)
  }

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
      period,
      targetFrequency: period === 'daily' ? 1 : targetFrequency,
    })
  }

  function selectPeriod(next: TargetPeriod) {
    setPeriod(next)
    if (next === 'daily') {
      setTargetFrequency(1)
    } else if (targetFrequency < 1) {
      setTargetFrequency(3)
    }
  }

  function handleIconUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      validateImageFile(file)
      const objectUrl = URL.createObjectURL(file)
      setCropSource(objectUrl)
      setUploadError(null)
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error ? uploadFailure.message : 'Could not upload that image.',
      )
    }
  }

  function handleCropApply(dataUrl: string) {
    setIcon(dataUrl)
    setUploadError(null)
    closeCropper()
  }

  return (
    <form onSubmit={handleSubmit} className="habit-form habit-form--composer">
      <header className="habit-form__header">
        <h2 className="habit-form__title">{isEditing ? 'Edit habit' : 'New habit'}</h2>
        {onCancel ? (
          <button
            type="button"
            className="habit-form__close"
            onClick={onCancel}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        ) : null}
      </header>

      <div className="habit-form__icon-rail" role="group" aria-label="Habit icon">
        {HABIT_ICON_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setIcon(option)
              setUploadError(null)
            }}
            aria-pressed={icon === option}
            aria-label={`Select ${option} icon`}
            className={`habit-form__icon-option ${
              icon === option ? 'habit-form__icon-option--selected' : ''
            }`}
          >
            {option}
          </button>
        ))}

        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          disabled={cropSource !== null}
          aria-pressed={customIconSelected}
          aria-label="Upload custom icon"
          className={`habit-form__icon-option habit-form__icon-option--upload ${
            customIconSelected
              ? 'habit-form__icon-option--upload-filled habit-form__icon-option--selected'
              : ''
          }`}
        >
          {customIconSelected ? (
            <HabitIcon icon={icon} size="md" className="habit-form__upload-preview" />
          ) : (
            <UploadIconGlyph />
          )}
        </button>
      </div>

      <input
        ref={uploadInputRef}
        id={uploadInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="habit-form__file-input"
        onChange={handleIconUpload}
        disabled={cropSource !== null}
        tabIndex={-1}
      />

      {uploadError ? (
        <p className="habit-form__upload-error" role="alert">
          {uploadError}
        </p>
      ) : null}

      <div className="habit-form__field">
        <label htmlFor="habit-name" className="habit-form__field-label">
          Habit name
        </label>
        <input
          id="habit-name"
          name="title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setError(null)
          }}
          placeholder="e.g. Drink water"
          maxLength={60}
          className="habit-form__input"
        />
      </div>

      <div className="habit-form__goal-row">
        <span className="habit-form__goal-label">Goal</span>
        <div className="habit-form__period" role="group" aria-label="Goal period">
          <button
            type="button"
            className={`habit-form__period-btn ${
              period === 'daily' ? 'habit-form__period-btn--selected' : ''
            }`}
            aria-pressed={period === 'daily'}
            onClick={() => selectPeriod('daily')}
          >
            Daily
          </button>
          <button
            type="button"
            className={`habit-form__period-btn ${
              period === 'weekly' ? 'habit-form__period-btn--selected' : ''
            }`}
            aria-pressed={period === 'weekly'}
            onClick={() => selectPeriod('weekly')}
          >
            Weekly
          </button>
        </div>
      </div>

      {period === 'weekly' ? (
        <div className="habit-form__frequency">
          <span className="habit-form__field-label">Times per week</span>
          <div className="habit-form__stepper">
            <button
              type="button"
              className="habit-form__stepper-btn"
              aria-label="Decrease frequency"
              disabled={targetFrequency <= 1}
              onClick={() => setTargetFrequency((value) => Math.max(1, value - 1))}
            >
              −
            </button>
            <span className="habit-form__stepper-value" aria-live="polite">
              {targetFrequency}
            </span>
            <button
              type="button"
              className="habit-form__stepper-btn"
              aria-label="Increase frequency"
              disabled={targetFrequency >= 7}
              onClick={() => setTargetFrequency((value) => Math.min(7, value + 1))}
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <div className="habit-form__reminder-panel">
        <div className="habit-form__reminder-row">
          <span className="habit-form__reminder-icon" aria-hidden="true">
            <BellReminderIcon size={18} />
          </span>
          <span className="habit-form__reminder-title">Reminder</span>

          <label className="habit-form__toggle">
            <input
              type="checkbox"
              role="switch"
              aria-label="Daily reminder"
              checked={reminderEnabled}
              onChange={(event) => {
                const enabled = event.target.checked
                setReminderEnabled(enabled)
                if (enabled) {
                  setReminderTime(getSuggestedReminderTime())
                }
              }}
              className="habit-form__toggle-input"
            />
            <span className="habit-form__toggle-track" aria-hidden="true">
              <span className="habit-form__toggle-thumb" />
            </span>
          </label>

          {reminderEnabled ? (
            <input
              id="habit-reminder-time"
              name="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              className="habit-form__time-input"
              aria-label="Reminder time"
            />
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="habit-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="habit-form__actions">
        {onCancel ? (
          <button type="button" className="habit-form__cancel" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="habit-form__submit" disabled={cropSource !== null}>
          {submitLabel}
        </button>
      </div>

      <CircularImageCropper
        open={cropSource !== null}
        imageSrc={cropSource ?? ''}
        title="Adjust your icon"
        hint="Drag to reposition. Use the slider or scroll to zoom."
        outputSize={HABIT_ICON_OUTPUT_SIZE}
        confirmLabel="Use icon"
        onApply={handleCropApply}
        onCancel={closeCropper}
      />
    </form>
  )
}
