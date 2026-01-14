import { NextRequest, NextResponse } from 'next/server'

import { todoStore } from '@/store/todo-store'
import type { TodoListResponse, TodoResponse } from '@/types/api'

import { withErrorHandler } from '../_lib/with-error-handler'
import { createTodoSchema } from '../_validations/todo'

// GET /api/todos - 전체 조회 (날짜 필터링 가능)
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') // 예: 2024-01-15

  let todos
  if (date) {
    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json<TodoListResponse>(
        { error: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' },
        { status: 400 }
      )
    }
    todos = todoStore.getByDate(date)
  } else {
    todos = todoStore.getAll()
  }

  return NextResponse.json<TodoListResponse>({ data: todos })
})

// POST /api/todos - 생성
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const validated = createTodoSchema.parse(body)

  const newTodo = todoStore.create({
    title: validated.title.trim(),
    completed: validated.completed,
    start_timestamp: validated.start_timestamp,
  })

  return NextResponse.json<TodoResponse>({ data: newTodo }, { status: 201 })
})
