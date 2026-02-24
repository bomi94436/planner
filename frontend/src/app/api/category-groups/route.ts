import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import type { CategoryGroupResponse, CategoryGroupsResponse } from '@/types/category-group'

import { withErrorHandler } from '../_lib'
import { createCategoryGroupSchema } from '../_validations'

/**
 * @swagger
 * /api/category-groups:
 *   get:
 *     tags:
 *       - CategoryGroup
 *     summary: 카테고리 그룹 목록 조회
 *     description: 카테고리 그룹 목록을 조회합니다. 소속 카테고리를 포함합니다.
 *     responses:
 *       200:
 *         description: 카테고리 그룹 목록
 */
export const GET = withErrorHandler(async () => {
  const categoryGroups = await prisma.categoryGroup.findMany({
    select: {
      id: true,
      name: true,
      color: true,
    },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json<CategoryGroupsResponse>({ data: categoryGroups })
})

/**
 * @swagger
 * /api/category-groups:
 *   post:
 *     tags:
 *       - CategoryGroup
 *     summary: 카테고리 그룹 생성
 *     description: 카테고리 그룹을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryGroupBody'
 *     responses:
 *       201:
 *         description: 카테고리 그룹 생성 성공
 */
export const POST = withErrorHandler(async (request) => {
  const body = await request.json()
  const validated = createCategoryGroupSchema.parse(body)

  const newCategoryGroup = await prisma.categoryGroup.create({
    data: {
      name: validated.name.trim(),
      color: validated.color,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  })
  return NextResponse.json<CategoryGroupResponse>({ data: newCategoryGroup }, { status: 201 })
})
