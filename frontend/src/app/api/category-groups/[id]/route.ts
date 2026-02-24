import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/app/api/_lib'
import { updateCategoryGroupSchema } from '@/app/api/_validations'
import { prisma } from '@/lib/prisma'
import type { CategoryGroupResponse, DeleteCategoryGroupResponse } from '@/types/category-group'

/**
 * @swagger
 * /api/category-groups/{id}:
 *   patch:
 *     tags:
 *       - CategoryGroup
 *     summary: 카테고리 그룹 수정
 *     description: 카테고리 그룹을 수정합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 카테고리 그룹 수정 성공
 *       404:
 *         description: 해당 카테고리 그룹을 찾을 수 없습니다.
 */
export const PATCH = withErrorHandler<{ id: string }>(async (request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  const existing = await prisma.categoryGroup.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json<CategoryGroupResponse>(
      { error: '해당 카테고리 그룹을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const validated = updateCategoryGroupSchema.parse(body)

  const updated = await prisma.categoryGroup.update({
    where: { id },
    data: {
      name: validated.name?.trim(),
      color: validated.color,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  })

  return NextResponse.json<CategoryGroupResponse>({ data: updated })
})

/**
 * @swagger
 * /api/category-groups/{id}:
 *   delete:
 *     tags:
 *       - CategoryGroup
 *     summary: 카테고리 그룹 삭제
 *     description: 카테고리 그룹을 삭제합니다. 소속 카테고리는 미소속 상태가 됩니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 카테고리 그룹 삭제 성공
 *       404:
 *         description: 해당 카테고리 그룹을 찾을 수 없습니다.
 */
export const DELETE = withErrorHandler<{ id: string }>(async (_request, context) => {
  const params = await context!.params
  const id = Number(params.id)

  const existing = await prisma.categoryGroup.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json<DeleteCategoryGroupResponse>(
      { error: '해당 카테고리 그룹을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  await prisma.categoryGroup.delete({ where: { id } })

  return NextResponse.json<DeleteCategoryGroupResponse>({ data: { id } })
})
