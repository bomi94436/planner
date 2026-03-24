import { NextResponse } from 'next/server'

import { withAuth } from '@/app/api/_lib'
import { updateHabitSchema } from '@/app/api/_validations'
import { prisma } from '@/config/prisma'
import type { DeleteHabitResponse, HabitBaseResponse } from '@/types/habit'

/**
 * @swagger
 * /api/habits/{id}:
 *   patch:
 *     tags:
 *       - Habit
 *     summary: 습관 수정
 *     description: 습관 정보를 수정합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Habit ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHabitBody'
 *     responses:
 *       200:
 *         description: 습관 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/HabitBase'
 *       404:
 *         description: 수정할 습관을 찾을 수 없습니다.
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

  const existing = await prisma.habit.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json<HabitBaseResponse>(
      { error: '해당 습관을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateHabitSchema.parse(body)

  const updated = await prisma.habit.update({
    where: { id },
    data: {
      name: validated.name?.trim(),
      levelEasy: validated.levelEasy?.trim(),
      levelNormal: validated.levelNormal?.trim(),
      levelChallenge: validated.levelChallenge?.trim(),
      categoryId: validated.categoryId,
    },
    select: {
      id: true,
      name: true,
      levelEasy: true,
      levelNormal: true,
      levelChallenge: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
    },
  })

  return NextResponse.json<HabitBaseResponse>({ data: updated })
})

/**
 * @swagger
 * /api/habits/{id}:
 *   delete:
 *     tags:
 *       - Habit
 *     summary: 습관 삭제
 *     description: 습관을 삭제합니다. 연결된 로그도 함께 삭제됩니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Habit ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 습관 삭제 성공
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
 *         description: 삭제할 습관을 찾을 수 없습니다.
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

  const existing = await prisma.habit.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json<DeleteHabitResponse>(
      { error: '해당 습관을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.habit.delete({ where: { id } })

  return NextResponse.json<DeleteHabitResponse>({ data: { id } })
})
