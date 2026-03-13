import { NextResponse } from 'next/server'

import { withAuth } from '@/app/api/_lib'
import { updateTaskSchema } from '@/app/api/_validations'
import { prisma } from '@/config/prisma'
import type { TaskUncheckedUpdateInput } from '@/generated/prisma/models/Task'
import type { DeleteTaskResponse, TaskResponse } from '@/types/task'

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     tags:
 *       - Task
 *     summary: Task 수정
 *     description: Task을 수정합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Task ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskBody'
 *     responses:
 *       200:
 *         description: Task 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: 수정할 Task을 찾을 수 없습니다.
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

  const existing = await prisma.task.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json<TaskResponse>(
      { error: '해당 Task를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateTaskSchema.parse(body)

  const updateData: TaskUncheckedUpdateInput = {
    title: validated.title?.trim(),
    completed: validated.completed,
    startTimestamp: validated.startTimestamp ? new Date(validated.startTimestamp) : undefined,
    endTimestamp: validated.endTimestamp ? new Date(validated.endTimestamp) : undefined,
    isAllDay: validated.isAllDay,
    categoryId: validated.categoryId,
  }

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      title: true,
      completed: true,
      startTimestamp: true,
      endTimestamp: true,
      isAllDay: true,
      planId: true,
      executionId: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
    },
  })

  return NextResponse.json<TaskResponse>({ data: updated })
})

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Task
 *     summary: Task 삭제
 *     description: Task을 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Task ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task 삭제 성공
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
 *         description: 삭제할 Task을 찾을 수 없습니다.
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

  const existing = await prisma.task.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json<DeleteTaskResponse>(
      { error: '해당 Task를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.task.delete({
    where: { id },
  })

  return NextResponse.json<DeleteTaskResponse>({ data: { id } })
})
