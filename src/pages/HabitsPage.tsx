import { useState } from 'react'
import { HabitForm, type HabitFormValues } from '../components/habits/HabitForm'
import { HabitManageRow } from '../components/habits/HabitManageRow'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useHabits } from '../hooks/useHabits'
import {
  cancelHabitReminder,
  isNativeReminderSupported,
  syncHabitReminder,
} from '../services/habitReminderService'
import type { Habit } from '../types/habit'
import { AppLayout } from '../layouts/AppLayout'

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

  return (
    <AppLayout title="Habits" align="top">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage up to 8 active habits. Set daily reminders per habit on Android.
        </p>

        {isCreating ? (
          <div className="rounded-lg bg-surface p-4 shadow-md">
            <HabitForm
              submitLabel="Add habit"
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : editingHabit ? (
          <div className="rounded-lg bg-surface p-4 shadow-md">
            <HabitForm
              initialTitle={editingHabit.title}
              initialIcon={editingHabit.icon}
              initialReminderEnabled={editingHabit.reminderEnabled}
              initialReminderTime={editingHabit.reminderTime}
              submitLabel="Save changes"
              onSubmit={handleEdit}
              onCancel={() => setEditingHabit(null)}
            />
          </div>
        ) : (
          <Button fullWidth onClick={() => setIsCreating(true)}>
            Add new habit
          </Button>
        )}

        {error ? (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}

        {info ? (
          <p className="text-sm text-gray-600 dark:text-gray-400" role="status">
            {info}
          </p>
        ) : null}

        <section aria-label="Active habits" className="space-y-2">
          {habits.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-600 dark:border-gray-600 dark:text-gray-400">
              No active habits yet.
            </p>
          ) : (
            habits.map((habit) => (
              <HabitManageRow
                key={habit.id}
                habit={habit}
                onEdit={setEditingHabit}
                onArchive={setHabitToArchive}
              />
            ))
          )}
        </section>

        {archivedHabits.length > 0 && (
          <section aria-label="Archived habits" className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Archived
            </h2>
            {archivedHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 dark:border-gray-700 dark:bg-gray-900/40"
              >
                <span aria-hidden="true">{habit.icon}</span>
                <span className="flex-1 truncate line-through">{habit.title}</span>
              </div>
            ))}
          </section>
        )}
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
