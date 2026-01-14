import { NextResponse } from 'next/server'

import { todoStore } from '@/store/todo-store'
import type { DeleteTodoResponse, TodoResponse } from '@/types/api'

import { withErrorHandler } from '../../_lib/with-error-handler'
import { updateTodoSchema } from '../../_validations/todo'

// GET /api/todos/[id] - 단일 조회
export const GET = withErrorHandler<{ id: string }>(async (_request, context) => {
  const { id } = await context!.params
  const todo = todoStore.getById(id)

  if (!todo) {
    return NextResponse.json<TodoResponse>(
      { error: '해당 Todo를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  return NextResponse.json<TodoResponse>({ data: todo })
})

// PATCH /api/todos/[id] - 수정
export const PATCH = withErrorHandler<{ id: string }>(async (request, context) => {
  const { id } = await context!.params

  // 존재 여부 확인
  const existing = todoStore.getById(id)
  if (!existing) {
    return NextResponse.json<TodoResponse>(
      { error: '해당 Todo를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateTodoSchema.parse(body)

  const updateData = {
    ...validated,
    title: validated.title?.trim(),
  }

  const updated = todoStore.update(id, updateData)!

  return NextResponse.json<TodoResponse>({ data: updated })
})

// DELETE /api/todos/[id] - 삭제
export const DELETE = withErrorHandler<{ id: string }>(async (_request, context) => {
  const { id } = await context!.params

  // 존재 여부 확인
  const existing = todoStore.getById(id)
  if (!existing) {
    return NextResponse.json<DeleteTodoResponse>(
      { error: '해당 Todo를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  todoStore.delete(id)

  return NextResponse.json<DeleteTodoResponse>({ data: { id } })
})
