import { z } from 'zod'

// Plan 목록 조회 쿼리 파라미터 스키마
export const getPlansQuerySchema = z.object({
  startTimestamp: z
    .string()
    .datetime({ message: 'startTimestamp 형식이 올바르지 않습니다. (ISO 8601)' })
    .optional(),
  endTimestamp: z
    .string()
    .datetime({ message: 'endTimestamp 형식이 올바르지 않습니다. (ISO 8601)' })
    .optional(),
})

// Plan 생성 스키마
export const createPlanSchema = z.object({
  startTimestamp: z
    .string()
    .datetime({ message: 'startTimestamp 형식이 올바르지 않습니다. (ISO 8601)' }),
  endTimestamp: z
    .string()
    .datetime({ message: 'endTimestamp 형식이 올바르지 않습니다. (ISO 8601)' }),
  title: z.string().min(1, 'title은 필수 항목입니다.'),
  color: z.string().length(7, 'color은 7자리 문자열이어야 합니다. 예: #000000'),
})

// Plan 수정 스키마
export const updatePlanSchema = z
  .object({
    startTimestamp: z
      .string()
      .datetime({ message: 'startTimestamp 형식이 올바르지 않습니다. (ISO 8601)' })
      .optional(),
    endTimestamp: z
      .string()
      .datetime({ message: 'endTimestamp 형식이 올바르지 않습니다. (ISO 8601)' })
      .optional(),
    title: z.string().min(1, 'title은 필수 항목입니다.').optional(),
    color: z.string().length(7, 'color은 7자리 문자열이어야 합니다. 예: #000000').optional(),
    taskIds: z.array(z.number().int().positive()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 내용이 없습니다.' })
