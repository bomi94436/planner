import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { createPlanSchema, getPlansQuerySchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { PlanResponse, PlansResponse } from '@/types/plan'

/**
 * @swagger
 * /api/plans:
 *   get:
 *     tags:
 *       - Plan
 *     summary: Plan 목록 조회
 *     description: Plan 목록을 조회합니다.
 *     parameters:
 *       - name: startTimestamp
 *         in: query
 *         description: 시작 시간
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endTimestamp
 *         in: query
 *         description: 종료 시간
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Plan 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 */
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
    orderBy: [{ startTimestamp: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      title: true,
      completed: true,
      startTimestamp: true,
      endTimestamp: true,
      isAllDay: true,
    },
  })
  return NextResponse.json<PlansResponse>({ data: plans })
})

/**
 * @swagger
 * /api/plans:
 *   post:
 *     tags:
 *       - Plan
 *     summary: Plan 생성
 *     description: Plan을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlanBody'
 *     responses:
 *       201:
 *         description: Plan 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 */
export const POST = withErrorHandler(async (request) => {
  const body = await request.json()
  const validated = createPlanSchema.parse(body)

  const newPlan = await prisma.plan.create({
    data: {
      title: validated.title.trim(),
      startTimestamp: new Date(validated.startTimestamp),
      endTimestamp: new Date(validated.endTimestamp),
      isAllDay: validated.isAllDay,
    },
    select: {
      id: true,
      title: true,
      completed: true,
      startTimestamp: true,
      endTimestamp: true,
      isAllDay: true,
    },
  })

  return NextResponse.json<PlanResponse>({ data: newPlan }, { status: 201 })
})
