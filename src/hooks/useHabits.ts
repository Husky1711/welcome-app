import { useCallback, useState } from 'react'
import type { Habit, HabitInput } from '../types/habit'
import {
  addHabit,
  archiveHabit,
  getActiveHabits,
  getArchivedHabits,
  toggleHabitCompleted,
  updateHabit,
} from '../utils/habitStorage'
import { formatLocalDate } from '../utils/dateUtils'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => getActiveHabits())
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>(() => getArchivedHabits())

  const refresh = useCallback(() => {
    setHabits(getActiveHabits())
    setArchivedHabits(getArchivedHabits())
  }, [])

  const createHabit = useCallback(
    (input: HabitInput) => {
      const habit = addHabit(input)
      refresh()
      return habit
    },
    [refresh],
  )

  const editHabit = useCallback(
    (id: string, input: HabitInput) => {
      const habit = updateHabit(id, input)
      refresh()
      return habit
    },
    [refresh],
  )

  const archive = useCallback(
    (id: string) => {
      const archived = archiveHabit(id)
      refresh()
      return archived
    },
    [refresh],
  )

  const toggleToday = useCallback(
    (habitId: string, date: string = formatLocalDate()) => {
      const completed = toggleHabitCompleted(habitId, date)
      refresh()
      return completed
    },
    [refresh],
  )

  return {
    habits,
    archivedHabits,
    createHabit,
    editHabit,
    archive,
    toggleToday,
    refresh,
  }
}
