import type { z } from 'zod'

import type { createCategorySchema, updateCategorySchema } from '@/app/api/_validations'
import type { Category as PrismaCategory } from '@/generated/prisma/client'

import type { CategoryGroup } from './category-group'
import type { Response } from './index'

export type Category = Pick<PrismaCategory, 'id' | 'name' | 'color' | 'categoryGroupId'> & {
  categoryGroup?: CategoryGroup | null
}

export type CreateCategoryBody = z.infer<typeof createCategorySchema>
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>

export type CategoriesResponse = Response<Category[]>
export type CategoryResponse = Response<Category>
export type DeleteCategoryResponse = Response<{ id: number }>
