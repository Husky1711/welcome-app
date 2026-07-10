import { CalendarGrid } from '../components/habits/CalendarGrid'
import { DaySheet } from '../components/habits/DaySheet'
import { useCalendarTracker } from '../hooks/useCalendarTracker'
import { AppLayout } from '../layouts/AppLayout'
import { canEditHabitDate, formatMonthYear } from '../utils/dateUtils'
import { toggleHabitCompleted } from '../utils/habitStorage'

export function CalendarPage() {
  const {
    viewDate,
    today,
    days,
    dayStatuses,
    habits,
    selectedDate,
    selectedCompletedMap,
    selectedStreakMap,
    setSelectedDate,
    goToPreviousMonth,
    goToNextMonth,
    refresh,
  } = useCalendarTracker()

  function handleToggle(habitId: string) {
    if (!selectedDate || !canEditHabitDate(selectedDate)) return

    toggleHabitCompleted(habitId, selectedDate)
    refresh()
  }

  return (
    <AppLayout title="Calendar" align="top">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tap a day to review habits. Blue dot = all done, amber = partial, gray = none.
        </p>

        <CalendarGrid
          monthLabel={formatMonthYear(viewDate)}
          days={days}
          dayStatuses={dayStatuses}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={setSelectedDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" /> All done
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Partial
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" /> None
          </span>
        </div>
      </div>

      {selectedDate ? (
        <DaySheet
          date={selectedDate}
          habits={habits}
          completedMap={selectedCompletedMap}
          streakMap={selectedStreakMap}
          onToggle={handleToggle}
          onClose={() => setSelectedDate(null)}
        />
      ) : null}
    </AppLayout>
  )
}
