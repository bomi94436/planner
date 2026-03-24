import { NextResponse } from 'next/server'

import { prisma } from '@/config/prisma'
import type { HabitLogResponse } from '@/types/habit'

import { withAuth } from '../_lib'
import { upsertHabitLogSchema } from '../_validations'

/**
 * @swagger
 * /api/habit-logs:
 *   post:
 *     tags:
 *       - HabitLog
 *     summary: 습관 로그 생성/수정
 *     description: 습관 로그를 생성하거나 수정합니다. 같은 날짜에 이미 로그가 있으면 수정합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertHabitLogBody'
 *     responses:
 *       200:
 *         description: 습관 로그 생성/수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/HabitLog'
 *       404:
 *         description: 해당 습관을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: 'string' }
 */
export const POST = withAuth(async (request, { userId }) => {
  const body = await request.json()
  const validated = upsertHabitLogSchema.parse(body)

  // 소유권 확인
  const habit = await prisma.habit.findFirst({
    where: { id: validated.habitId, userId },
  })
  if (!habit) {
    return NextResponse.json<HabitLogResponse>(
      { error: '해당 습관을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const habitLog = await prisma.habitLog.upsert({
    where: {
      habitId_date: {
        habitId: validated.habitId,
        date: new Date(validated.date),
      },
    },
    create: {
      habitId: validated.habitId,
      date: new Date(validated.date),
      completedLevel: validated.completedLevel,
      userId,
    },
    update: {
      completedLevel: validated.completedLevel,
    },
    select: {
      id: true,
      habitId: true,
      date: true,
      completedLevel: true,
    },
  })

  return NextResponse.json<HabitLogResponse>({
    data: {
      ...habitLog,
      date: habitLog.date.toISOString().split('T')[0],
    },
  })
})
