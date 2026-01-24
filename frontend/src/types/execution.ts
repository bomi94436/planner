import type { z } from 'zod'

import type {
  createExecutionSchema,
  getExecutionsQuerySchema,
  updateExecutionSchema,
} from '@/app/api/_validations'
import type { Execution as PrismaExecution } from '@/generated/prisma/client'

export type Execution = Pick<
  PrismaExecution,
  'id' | 'startTimestamp' | 'endTimestamp' | 'title' | 'color'
>

import type { Response } from './index'

export type CreateExecutionBody = z.infer<typeof createExecutionSchema>
export type UpdateExecutionBody = z.infer<typeof updateExecutionSchema>
export type GetExecutionsQuery = z.infer<typeof getExecutionsQuerySchema>

export type ExecutionsResponse = Response<Execution[]>

export type ExecutionResponse = Response<Execution>

export type DeleteExecutionResponse = Response<{ id: number }>
