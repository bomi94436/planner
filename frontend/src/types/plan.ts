import type { z } from 'zod'

import type {
  createPlanSchema,
  getPlansQuerySchema,
  updatePlanSchema,
} from '@/app/api/_validations'
import type { Plan as PrismaPlan } from '@/generated/prisma/client'

export type Plan = Pick<
  PrismaPlan,
  'id' | 'title' | 'completed' | 'startTimestamp' | 'endTimestamp' | 'isAllDay'
>

import type { Response } from './index'

// 타입 추론
export type CreatePlanBody = z.infer<typeof createPlanSchema>
export type UpdatePlanBody = z.infer<typeof updatePlanSchema>
export type GetPlansQuery = z.infer<typeof getPlansQuerySchema>

// Plan 목록 조회 응답 타입
export type PlansResponse = Response<Plan[]>

// Plan 단일 조회/생성/수정 응답 타입
export type PlanResponse = Response<Plan>

// Plan 삭제 응답 타입
export type DeletePlanResponse = Response<{ id: number }>
