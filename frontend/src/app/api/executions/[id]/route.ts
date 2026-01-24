import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { updateExecutionSchema } from '@/app/api/_validations'
import type { ExecutionUpdateInput } from '@/generated/prisma/models/Execution'
import { prisma } from '@/lib/prisma'
import type { DeleteExecutionResponse, ExecutionResponse } from '@/types/execution'

// PATCH /api/executions/[id] - 수정
export const PATCH = withErrorHandler<{ id: string }>(async (request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  // 존재 여부 확인
  const existing = await prisma.execution.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json<ExecutionResponse>(
      { error: '해당 Execution을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateExecutionSchema.parse(body)

  const updateData: ExecutionUpdateInput = {
    title: validated.title?.trim(),
    color: validated.color,
    startTimestamp: validated.startTimestamp ? new Date(validated.startTimestamp) : undefined,
    endTimestamp: validated.endTimestamp ? new Date(validated.endTimestamp) : undefined,
  }

  const updated = await prisma.execution.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json<ExecutionResponse>({ data: updated })
})

// DELETE /api/executions/[id] - 삭제
export const DELETE = withErrorHandler<{ id: string }>(async (_request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  // 존재 여부 확인
  const existing = await prisma.execution.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json<DeleteExecutionResponse>(
      { error: '해당 Execution을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.execution.delete({
    where: { id },
  })

  return NextResponse.json<DeleteExecutionResponse>({ data: { id } })
})
