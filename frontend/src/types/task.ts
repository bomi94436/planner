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
>

import type { Response } from './index'

// 타입 추론
export type CreateTaskBody = z.infer<typeof createTaskSchema>
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>

// Task 목록 조회 응답 타입
export type TasksResponse = Response<Task[]>

// Task 단일 조회/생성/수정 응답 타입
export type TaskResponse = Response<Task>

// Task 삭제 응답 타입
export type DeleteTaskResponse = Response<{ id: number }>
