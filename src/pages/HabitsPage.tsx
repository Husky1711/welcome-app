import { useEffect, useState } from 'react'
import { HabitForm, type HabitFormValues } from '../components/habits/HabitForm'
import { HabitIcon } from '../components/habits/HabitIcon'
import { HabitManageRow } from '../components/habits/HabitManageRow'
import { HabitShareSheet } from '../components/habits/HabitShareSheet'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { MAX_HABITS } from '../constants/habits'
import { useHabits } from '../hooks/useHabits'
import {
  cancelHabitReminder,
  getStoredReminderIssue,
  isExactAlarmGranted,
  openExactAlarmSettings,
  rescheduleAllHabitReminders,
  syncHabitReminder,
} from '../services/habitReminderService'
import type { Habit } from '../types/habit'
import { AppLayout } from '../layouts/AppLayout'
import { getActiveTarget, supersedeTarget } from '../utils/habitStorage'
import '../styles/habits-page.css'

export function HabitsPage() {
  const { habits, archivedHabits, createHabit, editHabit, archive } = useHabits()
  const [isCreating, setIsCreating] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [sharingHabit, setSharingHabit] = useState<Habit | null>(null)
  const [habitToArchive, setHabitToArchive] = useState<Habit | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [showExactAlarmAction, setShowExactAlarmAction] = useState(false)

  async function applyReminder(habit: Habit, enabled: boolean) {
    if (!enabled) {
      await cancelHabitReminder(habit.id)
      return
    }

    const result = await syncHabitReminder(habit)

    if (result.status === 'scheduled') {
      setShowExactAlarmAction(false)
      if (result.message) {
        setInfo(result.message)
      }
      return
    }

    if (result.status === 'unsupported') {
      setInfo('Reminder saved. Notifications fire in the Android app after you allow permission.')
      return
    }

    if (result.status === 'exact_alarms_denied') {
      setInfo(result.message ?? null)
      setShowExactAlarmAction(true)
      return
    }

    if (result.status === 'notifications_denied' || result.status === 'schedule_failed') {
      editHabit(habit.id, {
        title: habit.title,
        icon: habit.icon,
        reminderEnabled: false,
        reminderTime: habit.reminderTime,
      })
      setError(result.message ?? 'Could not enable this reminder.')
      setShowExactAlarmAction(false)
    }
  }

  async function handleOpenExactAlarmSettings() {
    const granted = await openExactAlarmSettings()
    if (granted) {
      setShowExactAlarmAction(false)
      setInfo(null)
      await rescheduleAllHabitReminders(true)
      return
    }

    setInfo(
      'Open app settings and allow Alarms & reminders for Welcome App, then return here.',
    )
  }

  async function handleCreate(values: HabitFormValues) {
    try {
      setError(null)
      setInfo(null)
      const habit = createHabit(values)
      supersedeTarget(habit.id, values.period, values.targetFrequency)
      setIsCreating(false)
      await applyReminder(habit, values.reminderEnabled)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not add habit.')
    }
  }

  async function handleEdit(values: HabitFormValues) {
    if (!editingHabit) return

    setError(null)
    setInfo(null)
    const habit = editHabit(editingHabit.id, values)
    supersedeTarget(editingHabit.id, values.period, values.targetFrequency)
    setEditingHabit(null)

    if (habit) {
      await applyReminder(habit, values.reminderEnabled)
    }
  }

  async function handleConfirmArchive() {
    if (!habitToArchive) return

    await cancelHabitReminder(habitToArchive.id)
    archive(habitToArchive.id)
    if (editingHabit?.id === habitToArchive.id) {
      setEditingHabit(null)
    }
    setHabitToArchive(null)
  }

  const showAddButton = !isCreating && !editingHabit && habits.length < MAX_HABITS

  useEffect(() => {
    const storedIssue = getStoredReminderIssue()
    if (storedIssue) {
      setInfo(storedIssue)
      setShowExactAlarmAction(storedIssue.toLowerCase().includes('alarms'))
    }
  }, [])

  useEffect(() => {
    async function refreshExactAlarmBanner() {
      if (document.visibilityState !== 'visible') return
      const granted = await isExactAlarmGranted()
      if (!granted) return
      setShowExactAlarmAction(false)
      const storedIssue = getStoredReminderIssue()
      if (storedIssue?.toLowerCase().includes('alarms')) {
        setInfo(null)
      }
      await rescheduleAllHabitReminders(true)
    }

    document.addEventListener('visibilitychange', refreshExactAlarmBanner)
    window.addEventListener('focus', refreshExactAlarmBanner)
    return () => {
      document.removeEventListener('visibilitychange', refreshExactAlarmBanner)
      window.removeEventListener('focus', refreshExactAlarmBanner)
    }
  }, [])

  useEffect(() => {
    if (!isCreating && !editingHabit) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCreating(false)
        setEditingHabit(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isCreating, editingHabit])

  return (
    <AppLayout align="top">
      <div className="habits-page habits-page--editorial">
        <header className="habits-page__top">
          <div className="habits-page__heading">
            <h1 className="habits-page__title">Habits</h1>
            <p className="habits-page__count">
              {habits.length} active · {MAX_HABITS} max
            </p>
          </div>
          {showAddButton ? (
            <button
              type="button"
              className="habits-page__add-circle"
              onClick={() => setIsCreating(true)}
              aria-label="Add habit"
            >
              <span aria-hidden="true">+</span>
            </button>
          ) : null}
        </header>

        {error ? (
          <p className="habits-page__feedback habits-page__feedback--error" role="alert">
            {error}
          </p>
        ) : null}

        {info ? (
          <div className="habits-page__feedback habits-page__feedback--info" role="status">
            <p>{info}</p>
            {showExactAlarmAction ? (
              <button
                type="button"
                className="habits-page__feedback-action"
                onClick={() => void handleOpenExactAlarmSettings()}
              >
                Open alarm settings
              </button>
            ) : null}
          </div>
        ) : null}

        <section className="habit-sheet" aria-label="Active habits">
          {habits.length === 0 ? (
            <div className="habits-empty">
              <p>No active habits yet. Add one to start building your daily rhythm.</p>
            </div>
          ) : (
            <ul className="habit-sheet__list">
              {habits.map((habit) => (
                <HabitManageRow
                  key={habit.id}
                  habit={habit}
                  onEdit={setEditingHabit}
                />
              ))}

              {showAddButton ? (
                <li className="habit-sheet__add-row">
                  <button
                    type="button"
                    className="habit-sheet__add-btn"
                    onClick={() => setIsCreating(true)}
                  >
                    <span className="habit-sheet__add-icon" aria-hidden="true">
                      +
                    </span>
                    Add new habit
                  </button>
                </li>
              ) : null}
            </ul>
          )}

          {habits.length === 0 && showAddButton ? (
            <button
              type="button"
              className="habit-sheet__add-btn habit-sheet__add-btn--lonely"
              onClick={() => setIsCreating(true)}
            >
              <span className="habit-sheet__add-icon" aria-hidden="true">
                +
              </span>
              Add new habit
            </button>
          ) : null}
        </section>

        {archivedHabits.length > 0 ? (
          <section className="habits-archived" aria-label="Archived habits">
            <h2 className="habits-archived__title">Archived</h2>
            {archivedHabits.map((habit) => (
              <div key={habit.id} className="habit-archived-row">
                <HabitIcon icon={habit.icon} size="sm" className="habit-archived-row__icon" />
                <span className="habit-archived-row__title">{habit.title}</span>
              </div>
            ))}
          </section>
        ) : null}
      </div>

      {isCreating || editingHabit ? (
        <div
          className="habit-composer"
          role="dialog"
          aria-modal="true"
          aria-label={editingHabit ? 'Edit habit' : 'New habit'}
        >
          <button
            type="button"
            className="habit-composer__backdrop"
            aria-label="Dismiss"
            onClick={() => {
              setIsCreating(false)
              setEditingHabit(null)
            }}
          />
          <div className="habit-composer__panel">
            {isCreating ? (
              <HabitForm
                submitLabel="Add habit"
                onSubmit={handleCreate}
                onCancel={() => setIsCreating(false)}
              />
            ) : null}
            {editingHabit ? (
              <>
                <HabitForm
                  key={editingHabit.id}
                  initialTitle={editingHabit.title}
                  initialIcon={editingHabit.icon}
                  initialReminderEnabled={editingHabit.reminderEnabled}
                  initialReminderTime={editingHabit.reminderTime}
                  initialPeriod={getActiveTarget(editingHabit.id)?.period ?? 'daily'}
                  initialTargetFrequency={
                    getActiveTarget(editingHabit.id)?.targetFrequency ?? 1
                  }
                  submitLabel="Save changes"
                  onSubmit={handleEdit}
                  onCancel={() => setEditingHabit(null)}
                />
                <button
                  type="button"
                  className="habit-composer__share"
                  onClick={() => {
                    setSharingHabit(editingHabit)
                    setEditingHabit(null)
                  }}
                  aria-label={`Share streak for ${editingHabit.title}`}
                >
                  Share streak
                </button>
                <button
                  type="button"
                  className="habit-composer__archive"
                  onClick={() => setHabitToArchive(editingHabit)}
                  aria-label={`Archive habit ${editingHabit.title}`}
                >
                  Archive habit
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {sharingHabit ? (
        <HabitShareSheet habit={sharingHabit} onClose={() => setSharingHabit(null)} />
      ) : null}

      <ConfirmDialog
        open={habitToArchive !== null}
        title="Archive habit?"
        message={
          habitToArchive
            ? `"${habitToArchive.title}" will be archived. Its reminder will be turned off.`
            : ''
        }
        confirmLabel="Archive"
        destructive
        onConfirm={handleConfirmArchive}
        onCancel={() => setHabitToArchive(null)}
      />
    </AppLayout>
  )
}
