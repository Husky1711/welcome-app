export interface Habit {
  id: string
  title: string
  icon: string
  reminderEnabled: boolean
  reminderTime: string
  notificationId?: number
  sortOrder: number
  isArchived: boolean
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
  completedAt?: string
}

export interface HabitInput {
  title: string
  icon: string
}

export interface DayProgress {
  completed: number
  total: number
  percent: number
}

export interface HabitSuggestion {
  title: string
  icon: string
}
