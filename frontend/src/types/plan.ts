import type { z } from 'zod'

import type {
  createPlanSchema,
  getPlansQuerySchema,
  updatePlanSchema,
} from '@/app/api/_validations'
import type { Plan as PrismaPlan } from '@/generated/prisma/client'

export type Plan = Pick<PrismaPlan, 'id' | 'startTimestamp' | 'endTimestamp' | 'title' | 'color'>

import type { Response } from './index'

export type CreatePlanBody = z.infer<typeof createPlanSchema>
export type UpdatePlanBody = z.infer<typeof updatePlanSchema>
export type GetPlansQuery = z.infer<typeof getPlansQuerySchema>

export type PlansResponse = Response<Plan[]>
export type PlanResponse = Response<Plan>
export type DeletePlanResponse = Response<{ id: number }>
