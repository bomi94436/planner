import type { Todo } from './daily'

// 성공 응답 타입
export interface SuccessResponse<T> {
  data: T
}

// 에러 응답 타입
export interface ErrorResponse {
  error: string
}

// Todo 생성 요청 타입
export interface CreateTodoRequest {
  title: string
  start_timestamp: string // ISO 8601 형식
  completed?: boolean // 기본값: false
}

// Todo 수정 요청 타입 (모든 필드 선택적)
export interface UpdateTodoRequest {
  title?: string
  completed?: boolean
  start_timestamp?: string
}

// Todo 목록 조회 응답 타입
export type TodoListResponse = SuccessResponse<Todo[]> | ErrorResponse

// Todo 단일 조회/생성/수정 응답 타입
export type TodoResponse = SuccessResponse<Todo> | ErrorResponse

// Todo 삭제 응답 타입
export type DeleteTodoResponse = SuccessResponse<{ id: string }> | ErrorResponse
