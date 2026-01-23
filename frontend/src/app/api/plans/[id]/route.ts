import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { updatePlanSchema } from '@/app/api/_validations'
import type { PlanUpdateInput } from '@/generated/prisma/models/Plan'
import { prisma } from '@/lib/prisma'
import type { DeletePlanResponse, PlanResponse } from '@/types/plan'

// PATCH /api/plans/[id] - 수정
export const PATCH = withErrorHandler<{ id: string }>(async (request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  // 존재 여부 확인
  const existing = await prisma.plan.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json<PlanResponse>(
      { error: '해당 Plan을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updatePlanSchema.parse(body)

  const updateData: PlanUpdateInput = {
    title: validated.title?.trim(),
    completed: validated.completed,
    startTimestamp: validated.startTimestamp ? new Date(validated.startTimestamp) : undefined,
    endTimestamp: validated.endTimestamp ? new Date(validated.endTimestamp) : undefined,
    isAllDay: validated.isAllDay,
  }

  const updated = await prisma.plan.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json<PlanResponse>({ data: updated })
})

// DELETE /api/plans/[id] - 삭제
export const DELETE = withErrorHandler<{ id: string }>(async (_request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  // 존재 여부 확인
  const existing = await prisma.plan.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json<DeletePlanResponse>(
      { error: '해당 Plan을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.plan.delete({
    where: { id },
  })

  return NextResponse.json<DeletePlanResponse>({ data: { id } })
})
