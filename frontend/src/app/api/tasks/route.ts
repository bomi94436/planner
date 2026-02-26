import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { createTaskSchema, getTasksQuerySchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { TaskResponse, TasksResponse } from '@/types/task'

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags:
 *       - Task
 *     summary: Task 목록 조회
 *     description: Task 목록을 조회합니다.
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
 *         description: Task 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
export const GET = withErrorHandler(async (request) => {
  const searchParams = request.nextUrl.searchParams
  const { startTimestamp, endTimestamp } = getTasksQuerySchema.parse({
    startTimestamp: searchParams.get('startTimestamp') ?? undefined,
    endTimestamp: searchParams.get('endTimestamp') ?? undefined,
  })

  // 조회 범위와 겹치는 모든 Task 조회
  // 두 범위가 겹치는 조건: Task.start <= 조회.end AND Task.end >= 조회.start
  //
  // [Case 1] Task이 조회 범위 내에 있음
  //   조회:  |---------|
  //   Task:    |---|
  //
  // [Case 2] Task이 조회 범위를 포함
  //   조회:    |---|
  //   Task:  |---------|
  //
  // [Case 3] 부분적으로 겹침
  //   조회:  |---------|
  //   Task:       |---------|
  const tasks = await prisma.task.findMany({
    where: {
      AND: [
        { startTimestamp: { lte: endTimestamp } }, // Task 시작 <= 조회 끝
        { endTimestamp: { gte: startTimestamp } }, // 조회 시작 <= Task 끝
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
      planId: true,
      executionId: true,
      categoryId: true,
      category: { select: { id: true, name: true, color: true } },
    },
  })
  return NextResponse.json<TasksResponse>({ data: tasks })
})

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags:
 *       - Task
 *     summary: Task 생성
 *     description: Task을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskBody'
 *     responses:
 *       201:
 *         description: Task 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 */
export const POST = withErrorHandler(async (request) => {
  const body = await request.json()
  const validated = createTaskSchema.parse(body)

  const newTask = await prisma.task.create({
    data: {
      title: validated.title.trim(),
      startTimestamp: new Date(validated.startTimestamp),
      endTimestamp: new Date(validated.endTimestamp),
      isAllDay: validated.isAllDay,
      categoryId: validated.categoryId ?? null,
    },
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

  return NextResponse.json<TaskResponse>({ data: newTask }, { status: 201 })
})
