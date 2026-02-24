import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { updateCategorySchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { CategoryResponse, DeleteCategoryResponse } from '@/types/category'

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     tags:
 *       - Category
 *     summary: 카테고리 수정
 *     description: 카테고리를 수정합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 카테고리 수정 성공
 *       404:
 *         description: 해당 카테고리를 찾을 수 없습니다.
 */
export const PATCH = withErrorHandler<{ id: string }>(async (request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json<CategoryResponse>(
      { error: '해당 카테고리를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateCategorySchema.parse(body)

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: validated.name?.trim(),
      color: validated.color,
      ...(validated.categoryGroupId !== undefined && {
        categoryGroupId: validated.categoryGroupId,
      }),
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

  return NextResponse.json<CategoryResponse>({ data: updated })
})

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - Category
 *     summary: 카테고리 삭제
 *     description: 카테고리를 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 카테고리 삭제 성공
 *       404:
 *         description: 해당 카테고리를 찾을 수 없습니다.
 */
export const DELETE = withErrorHandler<{ id: string }>(async (_request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json<DeleteCategoryResponse>(
      { error: '해당 카테고리를 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.category.delete({ where: { id } })

  return NextResponse.json<DeleteCategoryResponse>({ data: { id } })
})
