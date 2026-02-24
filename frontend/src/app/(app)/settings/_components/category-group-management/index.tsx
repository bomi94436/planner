'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, TagIcon } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import type { CategoryGroup } from '@/types/category-group'
import { deleteCategoryGroup, getCategoryGroups } from '~/settings/_api/func'

import { CategoryGroupFormDialog } from './category-group-form-dialog'

export function CategoryGroupManagement() {
  const queryClient = useQueryClient()
  const [editTargetGroup, setEditTargetGroup] = useState<CategoryGroup | null>(null)
  const [deleteTargetGroup, setDeleteTargetGroup] = useState<CategoryGroup | null>(null)

  const { data: categoryGroups = [] } = useQuery({
    queryKey: ['categoryGroups'],
    queryFn: getCategoryGroups,
  })

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteCategoryGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryGroups'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteTargetGroup(null)
    },
  })

  return (
    <section>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">카테고리 그룹</h2>
        <CategoryGroupFormDialog mode="add">
          <Button variant="default" size="icon-xs">
            <PlusIcon />
          </Button>
        </CategoryGroupFormDialog>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {categoryGroups.map((group) => (
          <DropdownMenu key={group.id}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-accent"
              >
                <TagIcon className="size-4" style={{ color: group.color }} />
                {group.name}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setEditTargetGroup(group)}>수정</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteTargetGroup(group)}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
        {categoryGroups.length === 0 && (
          <p className="text-sm text-muted-foreground">카테고리 그룹이 없습니다.</p>
        )}
      </div>

      <CategoryGroupFormDialog
        mode="edit"
        open={editTargetGroup !== null}
        categoryGroup={editTargetGroup}
        onOpenChange={(open) => {
          if (!open) setEditTargetGroup(null)
        }}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTargetGroup} onOpenChange={() => setDeleteTargetGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 그룹 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{deleteTargetGroup?.name}&apos; 그룹을 삭제하시겠습니까? 이 그룹에 속한
              카테고리는 미소속 상태가 됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetGroup && deleteMutation(deleteTargetGroup.id)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
