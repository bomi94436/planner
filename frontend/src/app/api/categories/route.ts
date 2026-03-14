import { NextResponse } from 'next/server'

import { prisma } from '@/config/prisma'
import type { CategoriesResponse, CategoryResponse } from '@/types/category'

import { withAuth } from '../_lib'
import { createCategorySchema } from '../_validations'

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Category
 *     summary: 카테고리 목록 조회
 *     description: 카테고리 목록을 조회합니다. 소속 그룹 정보를 포함합니다.
 *     responses:
 *       200:
 *         description: 카테고리 목록
 */
export const GET = withAuth(async (_request, { userId }) => {
  const categories = await prisma.category.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      color: true,
      categoryGroupId: true,
      categoryGroup: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json<CategoriesResponse>({ data: categories })
})

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Category
 *     summary: 카테고리 생성
 *     description: 카테고리를 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryBody'
 *     responses:
 *       201:
 *         description: 카테고리 생성 성공
 */
export const POST = withAuth(async (request, { userId }) => {
  const body = await request.json()
  const validated = createCategorySchema.parse(body)

  const newCategory = await prisma.category.create({
    data: {
      name: validated.name.trim(),
      color: validated.color,
      categoryGroupId: validated.categoryGroupId ?? null,
      userId,
    },
    select: {
      id: true,
      name: true,
      color: true,
      categoryGroupId: true,
      categoryGroup: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  })
  return NextResponse.json<CategoryResponse>({ data: newCategory }, { status: 201 })
})
