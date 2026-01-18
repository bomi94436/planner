import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { createTodoSchema, getTodosQuerySchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { TodoResponse, TodosResponse } from '@/types/todo'

// GET /api/todos - 전체 조회 (날짜 필터링 가능)
export const GET = withErrorHandler(async (request) => {
  const searchParams = new URLSearchParams(request.url)
  const { startTimestamp, endTimestamp } = getTodosQuerySchema.parse({
    startTimestamp: searchParams.get('startTimestamp') ?? undefined,
    endTimestamp: searchParams.get('endTimestamp') ?? undefined,
  })

  const todos = await prisma.todo.findMany({
    where: {
      startTimestamp: {
        gte: startTimestamp,
        lte: endTimestamp,
      },
    },
    orderBy: { startTimestamp: 'asc' },
  })
  return NextResponse.json<TodosResponse>({ data: todos })
})

// POST /api/todos - 생성
export const POST = withErrorHandler(async (request) => {
  const body = await request.json()
  const validated = createTodoSchema.parse(body)

  const newTodo = await prisma.todo.create({
    data: {
      title: validated.title.trim(),
      completed: validated.completed,
      startTimestamp: new Date(validated.startTimestamp),
    },
  })

  return NextResponse.json<TodoResponse>({ data: newTodo }, { status: 201 })
})
