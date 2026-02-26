import type { z } from 'zod'

import type {
  createTaskSchema,
  getTasksQuerySchema,
  updateTaskSchema,
} from '@/app/api/_validations'
import type { Task as PrismaTask } from '@/generated/prisma/client'

export type Task = Pick<
  PrismaTask,
  | 'id'
  | 'title'
  | 'completed'
  | 'startTimestamp'
  | 'endTimestamp'
  | 'isAllDay'
  | 'planId'
  | 'executionId'
  | 'categoryId'
> & {
  category?: { id: number; name: string; color: string } | null
}

import type { Response } from './index'

export type CreateTaskBody = z.infer<typeof createTaskSchema>
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>

export type TasksResponse = Response<Task[]>
export type TaskResponse = Response<Task>
export type DeleteTaskResponse = Response<{ id: number }>
