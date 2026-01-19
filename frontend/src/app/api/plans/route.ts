import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { createPlanSchema, getPlansQuerySchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { PlanResponse, PlansResponse } from '@/types/plan'

// GET /api/plans - 전체 조회 (날짜 필터링 가능)
export const GET = withErrorHandler(async (request) => {
  const searchParams = new URLSearchParams(request.url)
  const { startTimestamp, endTimestamp } = getPlansQuerySchema.parse({
    startTimestamp: searchParams.get('startTimestamp') ?? undefined,
    endTimestamp: searchParams.get('endTimestamp') ?? undefined,
  })

  const plans = await prisma.plan.findMany({
    where: {
      startTimestamp: {
        gte: startTimestamp,
        lte: endTimestamp,
      },
    },
    orderBy: { startTimestamp: 'asc' },
  })
  return NextResponse.json<PlansResponse>({ data: plans })
})

// POST /api/plans - 생성
export const POST = withErrorHandler(async (request) => {
  const body = await request.json()
  const validated = createPlanSchema.parse(body)

  const newPlan = await prisma.plan.create({
    data: {
      title: validated.title.trim(),
      startTimestamp: new Date(validated.startTimestamp),
      endTimestamp: new Date(validated.endTimestamp || validated.startTimestamp),
      isAllDay: validated.isAllDay,
    },
  })

  return NextResponse.json<PlanResponse>({ data: newPlan }, { status: 201 })
})
