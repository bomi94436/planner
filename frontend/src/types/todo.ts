import type { Todo } from '@prisma/client'
import type { z } from 'zod'

import type {
  createTodoSchema,
  getTodosQuerySchema,
  updateTodoSchema,
} from '@/app/api/_validations'

import type { Response } from './index'

// 타입 추론
export type CreateTodoBody = z.infer<typeof createTodoSchema>
export type UpdateTodoBody = z.infer<typeof updateTodoSchema>
export type GetTodosQuery = z.infer<typeof getTodosQuerySchema>

// Todo 목록 조회 응답 타입
export type TodosResponse = Response<Todo[]>

// Todo 단일 조회/생성/수정 응답 타입
export type TodoResponse = Response<Todo>

// Todo 삭제 응답 타입
export type DeleteTodoResponse = Response<{ id: number }>
