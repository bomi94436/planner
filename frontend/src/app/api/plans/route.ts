import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { createPlanSchema, getPlansQuerySchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { PlanResponse, PlansResponse } from '@/types/plan'

// GET /api/plans - 전체 조회 (날짜 필터링 가능)
export const GET = withErrorHandler(async (request) => {
  const searchParams = request.nextUrl.searchParams
  const { startTimestamp, endTimestamp } = getPlansQuerySchema.parse({
    startTimestamp: searchParams.get('startTimestamp') ?? undefined,
    endTimestamp: searchParams.get('endTimestamp') ?? undefined,
  })

  // 조회 범위와 겹치는 모든 Plan 조회
  // 두 범위가 겹치는 조건: Plan.start <= 조회.end AND Plan.end >= 조회.start
  //
  // [Case 1] Plan이 조회 범위 내에 있음
  //   조회:  |---------|
  //   Plan:    |---|
  //
  // [Case 2] Plan이 조회 범위를 포함
  //   조회:    |---|
  //   Plan:  |---------|
  //
  // [Case 3] 부분적으로 겹침
  //   조회:  |---------|
  //   Plan:       |---------|
  const plans = await prisma.plan.findMany({
    where: {
      AND: [
        { startTimestamp: { lte: endTimestamp } }, // Plan 시작 <= 조회 끝
        { endTimestamp: { gte: startTimestamp } }, // 조회 시작 <= Plan 끝
      ],
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
