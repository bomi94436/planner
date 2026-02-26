import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { updatePlanSchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { DeletePlanResponse, PlanResponse } from '@/types/plan'

/**
 * @swagger
 * /api/plans/{id}:
 *   patch:
 *     tags:
 *       - Plan
 *     summary: Plan 수정
 *     description: Plan을 수정합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Plan ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlanBody'
 *     responses:
 *       200:
 *         description: Plan 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         description: 수정할 Plan을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: 'string' }
 */
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

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      title: validated.title?.trim(),
      categoryId: validated.categoryId,
      startTimestamp: validated.startTimestamp ? new Date(validated.startTimestamp) : undefined,
      endTimestamp: validated.endTimestamp ? new Date(validated.endTimestamp) : undefined,
      ...(validated.taskIds !== undefined && {
        tasks: { set: validated.taskIds.map((taskId) => ({ id: taskId })) },
      }),
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

  return NextResponse.json<PlanResponse>({ data: updated })
})

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     tags:
 *       - Plan
 *     summary: Plan 삭제
 *     description: Plan을 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Plan ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plan 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: 'integer' }
 *       404:
 *         description: 삭제할 Plan을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: 'string' }
 */
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
