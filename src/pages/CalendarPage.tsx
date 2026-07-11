import { useMemo } from 'react'
import { CalendarGrid } from '../components/habits/CalendarGrid'
import { CalendarMonthSnapshot } from '../components/habits/CalendarMonthSnapshot'
import { DaySheet } from '../components/habits/DaySheet'
import { useCalendarTracker } from '../hooks/useCalendarTracker'
import { AppLayout } from '../layouts/AppLayout'
import { canEditHabitDate, formatMonthYear } from '../utils/dateUtils'
import { toggleHabitCompleted } from '../utils/habitStorage'
import { getMonthSummary } from '../utils/habitStats'
import '../styles/calendar-page.css'
import '../styles/habits-page.css'

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

  const monthLabel = formatMonthYear(viewDate)
  const monthSummary = useMemo(
    () => getMonthSummary(viewDate.getFullYear(), viewDate.getMonth(), today),
    [viewDate, today, dayStatuses],
  )

  function handleToggle(habitId: string) {
    if (!selectedDate || !canEditHabitDate(selectedDate)) return

    toggleHabitCompleted(habitId, selectedDate)
    refresh()
  }

  return (
    <AppLayout
      title="Calendar"
      subtitle="Every day leaves a trace."
      showBrand
      align="top"
    >
      <div className="calendar-page">
        <CalendarMonthSnapshot monthLabel={monthLabel} summary={monthSummary} />

        <CalendarGrid
          monthLabel={monthLabel}
          days={days}
          dayStatuses={dayStatuses}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={setSelectedDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />
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
