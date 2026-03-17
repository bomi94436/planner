import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextResponse } from 'next/server'

import { prisma } from '@/config/prisma'
import type { HabitResponse, HabitsResponse } from '@/types/habit'

import { withAuth } from '../_lib'
import { createHabitSchema, getHabitsQuerySchema } from '../_validations'

dayjs.extend(utc)

// 전체 로그 날짜 배열로 통계 계산 (오름차순 정렬 전제)
function computeStats(dates: Date[]) {
  const totalDays = dates.length
  if (totalDays === 0) return { totalDays: 0, maxStreak: 0, currentStreak: 0 }

  const days = dates.map((d) => dayjs.utc(d))

  let streak = 1
  let maxStreak = 1

  for (let i = 1; i < days.length; i++) {
    if (days[i].diff(days[i - 1], 'day') === 1) {
      streak++
    } else {
      maxStreak = Math.max(maxStreak, streak)
      streak = 1
    }
  }
  maxStreak = Math.max(maxStreak, streak)

  // 마지막 연속 구간이 오늘 또는 어제로 끝나면 현재 연속일 유지
  const yesterday = dayjs.utc().subtract(1, 'day').startOf('day')
  const currentStreak = !days[days.length - 1].isBefore(yesterday, 'day') ? streak : 0

  return { totalDays, maxStreak, currentStreak }
}

/**
 * @swagger
 * /api/habits:
 *   get:
 *     tags:
 *       - Habit
 *     summary: 습관 목록 조회
 *     description: 습관 목록과 기간 내 로그, 전체 통계를 함께 조회합니다.
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: 로그 조회 시작일 (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *       - name: endDate
 *         in: query
 *         description: 로그 조회 종료일 (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 습관 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Habit'
 */
export const GET = withAuth(async (request, { userId }) => {
  const searchParams = request.nextUrl.searchParams
  const { startDate, endDate } = getHabitsQuerySchema.parse({
    startDate: searchParams.get('startDate') ?? undefined,
    endDate: searchParams.get('endDate') ?? undefined,
  })

  const startDateObj = startDate ? new Date(startDate) : undefined
  const endDateObj = endDate ? new Date(endDate) : undefined

  // 전체 로그를 포함한 습관 목록 조회 (통계는 JS에서 계산)
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      levelEasy: true,
      levelNormal: true,
      levelChallenge: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
      logs: {
        select: { id: true, date: true, completedLevel: true },
        orderBy: { date: 'asc' },
      },
    },
  })

  const data = habits.map((habit) => {
    const stats = computeStats(habit.logs.map((log) => log.date))
    const logs = habit.logs
      .filter((log) => {
        if (startDateObj && log.date < startDateObj) return false
        if (endDateObj && log.date > endDateObj) return false
        return true
      })
      .map((log) => ({ ...log, date: log.date.toISOString().split('T')[0] }))
    return { ...habit, stats, logs }
  })

  return NextResponse.json<HabitsResponse>({ data })
})

/**
 * @swagger
 * /api/habits:
 *   post:
 *     tags:
 *       - Habit
 *     summary: 습관 생성
 *     description: 새로운 습관을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHabitBody'
 *     responses:
 *       201:
 *         description: 습관 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Habit'
 */
export const POST = withAuth(async (request, { userId }) => {
  const body = await request.json()
  const validated = createHabitSchema.parse(body)

  const newHabit = await prisma.habit.create({
    data: {
      name: validated.name.trim(),
      levelEasy: validated.levelEasy.trim(),
      levelNormal: validated.levelNormal.trim(),
      levelChallenge: validated.levelChallenge.trim(),
      categoryId: validated.categoryId ?? null,
      userId,
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

  return NextResponse.json<HabitResponse>(
    {
      data: {
        ...newHabit,
        stats: { currentStreak: 0, maxStreak: 0, totalDays: 0 },
        logs: [],
      },
    },
    { status: 201 }
  )
})
