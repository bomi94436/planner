import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { updateTodoSchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { DeleteTodoResponse, TodoResponse } from '@/types/todo'

// PATCH /api/todos/[id] - 수정
export const PATCH = withErrorHandler<{ id: number }>(async (request, context) => {
  const { id } = await context!.params

  // 존재 여부 확인
  const existing = await prisma.todo.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json<TodoResponse>(
      { error: '해당 Todo를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateTodoSchema.parse(body)

  const updateData: {
    title?: string
    completed?: boolean
    startTimestamp?: Date
  } = {}

  if (validated.title !== undefined) {
    updateData.title = validated.title.trim()
  }
  if (validated.completed !== undefined) {
    updateData.completed = validated.completed
  }
  if (validated.startTimestamp !== undefined) {
    updateData.startTimestamp = new Date(validated.startTimestamp)
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json<TodoResponse>({ data: updated })
})

// DELETE /api/todos/[id] - 삭제
export const DELETE = withErrorHandler<{ id: number }>(async (_request, context) => {
  const { id } = await context!.params

  // 존재 여부 확인
  const existing = await prisma.todo.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json<DeleteTodoResponse>(
      { error: '해당 Todo를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.todo.delete({
    where: { id },
  })

  return NextResponse.json<DeleteTodoResponse>({ data: { id } })
})
