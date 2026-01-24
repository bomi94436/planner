import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import type { ExecutionResponse, ExecutionsResponse } from '@/types/execution'

import { withErrorHandler } from '../_lib'
import { createExecutionSchema, getExecutionsQuerySchema } from '../_validations'

/**
 * @swagger
 * /api/executions:
 *   get:
 *     tags:
 *       - Execution
 *     summary: Execution 목록 조회
 *     description: Execution 목록을 조회합니다.
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
 *         description: Execution 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Execution'
 */
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

/**
 * @swagger
 * /api/executions:
 *   post:
 *     tags:
 *       - Execution
 *     summary: Execution 생성
 *     description: Execution을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExecutionBody'
 *     responses:
 *       201:
 *         description: Execution 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Execution'
 */
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
