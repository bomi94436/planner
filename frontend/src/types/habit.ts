import type { z } from 'zod'

import type {
  createHabitSchema,
  getHabitsQuerySchema,
  updateHabitSchema,
  upsertHabitLogSchema,
} from '@/app/api/_validations'
import type { Habit as PrismaHabit, HabitLog as PrismaHabitLog } from '@/generated/prisma/client'

import type { Response } from './index'

// 기본 습관 타입
export type HabitBase = Pick<
  PrismaHabit,
  'id' | 'name' | 'levelEasy' | 'levelNormal' | 'levelChallenge' | 'categoryId'
> & {
  category?: { id: number; name: string; color: string } | null
}

// 습관 통계
export type HabitStats = {
  currentStreak: number
  maxStreak: number
  totalDays: number
}

// 습관 로그 항목 (GET 응답용)
export type HabitLogItem = Pick<PrismaHabitLog, 'id' | 'completedLevel'> & {
  date: string // YYYY-MM-DD
}

// 전체 습관 타입 (통계 + 로그 포함, GET 응답용)
export type Habit = HabitBase & {
  stats: HabitStats
  logs: HabitLogItem[]
}

// 습관 로그 (habit-logs 응답용)
export type HabitLog = Pick<PrismaHabitLog, 'id' | 'habitId' | 'completedLevel'> & {
  date: string // YYYY-MM-DD
}

export type CreateHabitBody = z.infer<typeof createHabitSchema>
export type UpdateHabitBody = z.infer<typeof updateHabitSchema>
export type GetHabitsQuery = z.infer<typeof getHabitsQuerySchema>
export type UpsertHabitLogBody = z.infer<typeof upsertHabitLogSchema>

export type HabitsResponse = Response<Habit[]>
export type HabitResponse = Response<Habit>
export type HabitBaseResponse = Response<HabitBase>
export type DeleteHabitResponse = Response<{ id: number }>
export type HabitLogResponse = Response<HabitLog>
export type DeleteHabitLogResponse = Response<{ id: number }>
