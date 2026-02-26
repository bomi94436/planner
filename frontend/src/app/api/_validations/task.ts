import { z } from 'zod'

// Task 생성 스키마
export const createTaskSchema = z.object({
  title: z.string().min(1, 'title은 필수 항목입니다.'),
  startTimestamp: z.string().datetime({ message: 'startTimestamp 형식이 올바르지 않습니다.' }),
  endTimestamp: z.string().datetime({ message: 'endTimestamp 형식이 올바르지 않습니다.' }),
  isAllDay: z.boolean().default(false).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
})

// Task 수정 스키마
export const updateTaskSchema = z
  .object({
    title: z.string().min(1, 'title은 비어있을 수 없습니다.').optional(),
    completed: z.boolean().optional(),
    startTimestamp: z
      .string()
      .datetime({ message: 'startTimestamp 형식이 올바르지 않습니다.' })
      .optional(),
    endTimestamp: z
      .string()
      .datetime({ message: 'endTimestamp 형식이 올바르지 않습니다.' })
      .optional(),
    isAllDay: z.boolean().optional(),
    categoryId: z.number().int().positive().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 내용이 없습니다.' })

// Task 목록 조회 쿼리 파라미터 스키마
export const getTasksQuerySchema = z.object({
  startTimestamp: z
    .string()
    .datetime({ message: 'startTimestamp 형식이 올바르지 않습니다. (ISO 8601)' })
    .optional(),
  endTimestamp: z
    .string()
    .datetime({ message: 'endTimestamp 형식이 올바르지 않습니다. (ISO 8601)' })
    .optional(),
})
