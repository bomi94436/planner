import { z } from 'zod'

// 카테고리 생성 스키마
export const createCategorySchema = z.object({
  name: z.string().min(1, 'name은 필수 항목입니다.').max(100, 'name은 100자 이하여야 합니다.'),
  color: z.string().length(7, 'color은 7자리 문자열이어야 합니다. 예: #000000'),
  categoryGroupId: z.number().int().positive().nullable().optional(),
})

// 카테고리 수정 스키마
export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .min(1, 'name은 필수 항목입니다.')
      .max(100, 'name은 100자 이하여야 합니다.')
      .optional(),
    color: z.string().length(7, 'color은 7자리 문자열이어야 합니다. 예: #000000').optional(),
    categoryGroupId: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 내용이 없습니다.' })
