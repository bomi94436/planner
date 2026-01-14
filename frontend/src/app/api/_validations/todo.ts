import { z } from 'zod'

// Todo 생성 스키마
export const createTodoSchema = z.object({
  title: z.string().min(1, 'title은 필수 항목입니다.'),
  start_timestamp: z.string().datetime({ message: 'start_timestamp 형식이 올바르지 않습니다.' }),
  completed: z.boolean().optional().default(false),
})

// Todo 수정 스키마
export const updateTodoSchema = z
  .object({
    title: z.string().min(1, 'title은 비어있을 수 없습니다.').optional(),
    completed: z.boolean().optional(),
    start_timestamp: z
      .string()
      .datetime({ message: 'start_timestamp 형식이 올바르지 않습니다.' })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 내용이 없습니다.' })

// 타입 추론
export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
