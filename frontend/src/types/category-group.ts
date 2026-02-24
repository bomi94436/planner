import type { z } from 'zod'

import type { createCategoryGroupSchema, updateCategoryGroupSchema } from '@/app/api/_validations'
import type { CategoryGroup as PrismaCategoryGroup } from '@/generated/prisma/client'

import type { Response } from './index'

export type CategoryGroup = Pick<PrismaCategoryGroup, 'id' | 'name' | 'color'>

export type CreateCategoryGroupBody = z.infer<typeof createCategoryGroupSchema>
export type UpdateCategoryGroupBody = z.infer<typeof updateCategoryGroupSchema>

export type CategoryGroupsResponse = Response<CategoryGroup[]>
export type CategoryGroupResponse = Response<CategoryGroup>
export type DeleteCategoryGroupResponse = Response<{ id: number }>
