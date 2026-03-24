import { z } from 'zod'

// 습관 목록 조회 쿼리 스키마
export const getHabitsQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate 형식이 올바르지 않습니다. (YYYY-MM-DD)')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate 형식이 올바르지 않습니다. (YYYY-MM-DD)')
    .optional(),
})

// 습관 생성 스키마
export const createHabitSchema = z.object({
  name: z.string().min(1, 'name은 필수 항목입니다.').max(100, 'name은 100자 이하여야 합니다.'),
  levelEasy: z
    .string()
    .min(1, 'levelEasy는 필수 항목입니다.')
    .max(255, 'levelEasy는 255자 이하여야 합니다.'),
  levelNormal: z
    .string()
    .min(1, 'levelNormal은 필수 항목입니다.')
    .max(255, 'levelNormal은 255자 이하여야 합니다.'),
  levelChallenge: z
    .string()
    .min(1, 'levelChallenge는 필수 항목입니다.')
    .max(255, 'levelChallenge는 255자 이하여야 합니다.'),
  categoryId: z.number().int().positive().nullable().optional(),
})

// 습관 수정 스키마
export const updateHabitSchema = z
  .object({
    name: z
      .string()
      .min(1, 'name은 필수 항목입니다.')
      .max(100, 'name은 100자 이하여야 합니다.')
      .optional(),
    levelEasy: z.string().min(1).max(255).optional(),
    levelNormal: z.string().min(1).max(255).optional(),
    levelChallenge: z.string().min(1).max(255).optional(),
    categoryId: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 내용이 없습니다.' })

// 습관 로그 조회 쿼리 스키마
export const getHabitLogsQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate 형식이 올바르지 않습니다. (YYYY-MM-DD)')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate 형식이 올바르지 않습니다. (YYYY-MM-DD)')
    .optional(),
})

// 습관 로그 생성/수정 스키마
export const upsertHabitLogSchema = z.object({
  habitId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다.'),
  completedLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})
