import type { Todo as PrismaTodo } from '@prisma/client'

import type { Response } from './index'

// Todo 생성 요청 타입
export interface CreateTodoRequest {
  title: string
  startTimestamp: string // ISO 8601 형식
  completed?: boolean // 기본값: false
}

// Todo 수정 요청 타입 (모든 필드 선택적)
export interface UpdateTodoRequest {
  title?: string
  completed?: boolean
  startTimestamp?: string
}

// Todo 목록 조회 응답 타입
export type TodoListResponse = Response<PrismaTodo[]>

// Todo 단일 조회/생성/수정 응답 타입
export type TodoResponse = Response<PrismaTodo>

// Todo 삭제 응답 타입
export type DeleteTodoResponse = Response<{ id: string }>
