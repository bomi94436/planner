import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import type { PlanResponse, PlansResponse } from '@/types/plan'

import { withErrorHandler } from '../_lib'
import { createPlanSchema, getPlansQuerySchema } from '../_validations'

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

  const plans = await prisma.plan.findMany({
    where: {
      startTimestamp: { lte: endTimestamp },
      endTimestamp: { gte: startTimestamp },
    },
    select: {
      id: true,
      startTimestamp: true,
      endTimestamp: true,
      title: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
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
      startTimestamp: new Date(validated.startTimestamp),
      endTimestamp: new Date(validated.endTimestamp),
      title: validated.title.trim(),
      categoryId: validated.categoryId ?? null,
    },
    select: {
      id: true,
      startTimestamp: true,
      endTimestamp: true,
      title: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
    },
  })
  return NextResponse.json<PlanResponse>({ data: newPlan }, { status: 201 })
})
