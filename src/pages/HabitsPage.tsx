import { useEffect, useState } from 'react'
import { HabitForm, type HabitFormValues } from '../components/habits/HabitForm'
import { HabitIcon } from '../components/habits/HabitIcon'
import { HabitManageRow } from '../components/habits/HabitManageRow'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useHabits } from '../hooks/useHabits'
import {
  cancelHabitReminder,
  isNativeReminderSupported,
  syncHabitReminder,
} from '../services/habitReminderService'
import type { Habit } from '../types/habit'
import { AppLayout } from '../layouts/AppLayout'
import '../styles/habits-page.css'

export function HabitsPage() {
  const { habits, archivedHabits, createHabit, editHabit, archive } = useHabits()
  const [isCreating, setIsCreating] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitToArchive, setHabitToArchive] = useState<Habit | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function applyReminder(habit: Habit, enabled: boolean) {
    if (!enabled) {
      await cancelHabitReminder(habit.id)
      return
    }

    const status = await syncHabitReminder(habit)
    if (status === 'denied') {
      setError(
        'Notification permission denied. Enable notifications in your device settings to get habit reminders.',
      )
      return
    }

    if (!isNativeReminderSupported()) {
      setInfo('Reminder saved. Notifications fire on the Android app after you allow permission.')
    }
  }

  async function handleCreate(values: HabitFormValues) {
    try {
      setError(null)
      setInfo(null)
      const habit = createHabit(values)
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

  const showAddButton = !isCreating && !editingHabit

  useEffect(() => {
    if (!editingHabit) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`habit-edit-${editingHabit.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [editingHabit])

  return (
    <AppLayout
      title="Habits"
      subtitle="Manage up to 8 active habits. Set daily reminders per habit on Android."
      showBrand
      align="top"
    >
      <div className="habits-page">
        {isCreating ? (
          <div className="habit-form-card">
            <HabitForm
              submitLabel="Add habit"
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : null}

        {error ? (
          <p className="habits-page__feedback habits-page__feedback--error" role="alert">
            {error}
          </p>
        ) : null}

        {info ? (
          <p className="habits-page__feedback habits-page__feedback--info" role="status">
            {info}
          </p>
        ) : null}

        <section aria-label="Active habits">
          {habits.length === 0 ? (
            <div className="habits-empty">
              <p>No active habits yet. Add one to start building your daily rhythm.</p>
            </div>
          ) : (
            <ul className="habits-page__list">
              {habits.map((habit) =>
                editingHabit?.id === habit.id ? (
                  <li key={habit.id} id={`habit-edit-${habit.id}`} className="habit-form-card">
                    <HabitForm
                      key={habit.id}
                      initialTitle={editingHabit.title}
                      initialIcon={editingHabit.icon}
                      initialReminderEnabled={editingHabit.reminderEnabled}
                      initialReminderTime={editingHabit.reminderTime}
                      submitLabel="Save changes"
                      onSubmit={handleEdit}
                      onCancel={() => setEditingHabit(null)}
                    />
                  </li>
                ) : (
                  <HabitManageRow
                    key={habit.id}
                    habit={habit}
                    onEdit={setEditingHabit}
                    onArchive={setHabitToArchive}
                  />
                ),
              )}
            </ul>
          )}
        </section>

        {showAddButton ? (
          <button type="button" className="habits-add-btn" onClick={() => setIsCreating(true)}>
            <span className="habits-add-btn__icon" aria-hidden="true">
              +
            </span>
            Add new habit
          </button>
        ) : null}

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
