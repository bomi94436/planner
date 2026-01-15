import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
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

    // 해당 날짜의 시작과 끝 시간 계산
    const startOfDay = new Date(`${date}T00:00:00.000Z`)
    const endOfDay = new Date(`${date}T23:59:59.999Z`)

    todos = await prisma.todo.findMany({
      where: {
        startTimestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTimestamp: 'asc' },
    })
  } else {
    todos = await prisma.todo.findMany({
      orderBy: { startTimestamp: 'asc' },
    })
  }

  return NextResponse.json<TodoListResponse>({
    data: todos.map((todo) => ({
      ...todo,
      startTimestamp: todo.startTimestamp.toISOString(),
    })),
  })
})

// POST /api/todos - 생성
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const validated = createTodoSchema.parse(body)

  const newTodo = await prisma.todo.create({
    data: {
      title: validated.title.trim(),
      completed: validated.completed,
      startTimestamp: new Date(validated.startTimestamp),
    },
  })

  return NextResponse.json<TodoResponse>(
    {
      data: {
        ...newTodo,
        startTimestamp: newTodo.startTimestamp.toISOString(),
      },
    },
    { status: 201 }
  )
})
