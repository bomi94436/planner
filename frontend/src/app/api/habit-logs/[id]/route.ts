import { NextResponse } from 'next/server'

import { withAuth } from '@/app/api/_lib'
import { prisma } from '@/config/prisma'
import type { DeleteHabitLogResponse } from '@/types/habit'

/**
 * @swagger
 * /api/habit-logs/{id}:
 *   delete:
 *     tags:
 *       - HabitLog
 *     summary: 습관 로그 삭제
 *     description: 특정 날짜의 습관 로그를 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: HabitLog ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 습관 로그 삭제 성공
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
 *         description: 삭제할 습관 로그를 찾을 수 없습니다.
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

  const existing = await prisma.habitLog.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json<DeleteHabitLogResponse>(
      { error: '해당 습관 로그를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.habitLog.delete({ where: { id } })

  return NextResponse.json<DeleteHabitLogResponse>({ data: { id } })
})
