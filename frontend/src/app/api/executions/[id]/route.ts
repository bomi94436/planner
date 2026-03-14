import { NextResponse } from 'next/server'

import { withAuth } from '@/app/api/_lib'
import { updateExecutionSchema } from '@/app/api/_validations'
import { prisma } from '@/config/prisma'
import type { DeleteExecutionResponse, ExecutionResponse } from '@/types/execution'

/**
 * @swagger
 * /api/executions/{id}:
 *   patch:
 *     tags:
 *       - Execution
 *     summary: Execution 수정
 *     description: Execution을 수정합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Execution ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExecutionBody'
 *     responses:
 *       200:
 *         description: Execution 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Execution'
 *       404:
 *         description: 수정할 Execution을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: 'string' }
 */
export const PATCH = withAuth<{ id: string }>(async (request, { params, userId }) => {
  const { id: rawId } = await params
  const id = Number(rawId)

  const existing = await prisma.execution.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json<ExecutionResponse>(
      { error: '해당 Execution을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateExecutionSchema.parse(body)

  const updated = await prisma.execution.update({
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

  return NextResponse.json<ExecutionResponse>({ data: updated })
})

/**
 * @swagger
 * /api/executions/{id}:
 *   delete:
 *     tags:
 *       - Execution
 *     summary: Execution 삭제
 *     description: Execution을 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Execution ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Execution 삭제 성공
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
 *         description: 삭제할 Execution을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: 'string' }
 */
export const DELETE = withAuth<{ id: string }>(async (_request, { params, userId }) => {
  const { id: rawId } = await params
  const id = Number(rawId)

  const existing = await prisma.execution.findFirst({ where: { id, userId } })
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
