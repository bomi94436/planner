import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import type { ExecutionResponse, ExecutionsResponse } from '@/types/execution'

import { withErrorHandler } from '../_lib'
import { createExecutionSchema, getExecutionsQuerySchema } from '../_validations'

// GET /api/executions - 목록 조회
export const GET = withErrorHandler(async (request) => {
  const searchParams = request.nextUrl.searchParams
  const { startTimestamp, endTimestamp } = getExecutionsQuerySchema.parse({
    startTimestamp: searchParams.get('startTimestamp') ?? undefined,
    endTimestamp: searchParams.get('endTimestamp') ?? undefined,
  })

  const executions = await prisma.execution.findMany({
    where: {
      startTimestamp: { lte: endTimestamp },
      endTimestamp: { gte: startTimestamp },
    },
  })
  return NextResponse.json<ExecutionsResponse>({ data: executions })
})

// POST /api/executions - 생성
export const POST = withErrorHandler(async (request) => {
  const body = await request.json()
  const validated = createExecutionSchema.parse(body)

  const newExecution = await prisma.execution.create({
    data: {
      startTimestamp: new Date(validated.startTimestamp),
      endTimestamp: new Date(validated.endTimestamp),
      title: validated.title.trim(),
      color: validated.color,
    },
  })
  return NextResponse.json<ExecutionResponse>({ data: newExecution }, { status: 201 })
})
