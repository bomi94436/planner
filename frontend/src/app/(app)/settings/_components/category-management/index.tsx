'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@/components/ui'
import type { Category } from '@/types/category'
import { deleteCategory, getCategories } from '~/settings/_api/func'

import { CategoryCard } from './category-card'
import { CategoryFormDialog } from './category-form-dialog'

export function CategoryManagement() {
  const queryClient = useQueryClient()
  const [editTargetCategory, setEditTargetCategory] = useState<Category | null>(null)
  const [deleteTargetCategory, setDeleteTargetCategory] = useState<Category | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteTargetCategory(null)
    },
  })

  return (
    <section>
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-semibold">카테고리</h2>
        <CategoryFormDialog mode="add">
          <Button variant="default" size="icon-xs">
            <PlusIcon />
          </Button>
        </CategoryFormDialog>
      </div>

      <div className="mt-3 rounded-lg border border-border">
        {categories.length > 0 ? (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={setEditTargetCategory}
              onDelete={setDeleteTargetCategory}
            />
          ))
        ) : (
          <p className="px-4 py-3 text-sm text-muted-foreground">카테고리가 없습니다.</p>
        )}
      </div>

      <CategoryFormDialog
        mode="edit"
        open={editTargetCategory !== null}
        category={editTargetCategory}
        onOpenChange={(open) => {
          if (!open) setEditTargetCategory(null)
        }}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTargetCategory} onOpenChange={() => setDeleteTargetCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{deleteTargetCategory?.name}&apos; 카테고리를 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetCategory && deleteMutation(deleteTargetCategory.id)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
