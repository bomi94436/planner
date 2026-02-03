'use client'
import { deletePlan, getPlans, updatePlan } from '@daily/_api/func'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { EllipsisIcon, FileIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

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
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Plan, UpdatePlanBody } from '@/types/plan'

import { PlanFormDialog } from './plan-form-dialog'

export function PlanList() {
  const { selectedDate } = useDateStore()
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [editTargetPlan, setEditTargetPlan] = useState<Plan | null>(null)

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans', selectedDate],
    queryFn: () =>
      getPlans({
        startTimestamp: dayjs(selectedDate).startOf('day').toISOString(),
        endTimestamp: dayjs(selectedDate).endOf('day').toISOString(),
      }),
  })

  const queryClient = useQueryClient()

  const { mutate: updatePlanMutation } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanBody }) => updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })

  const { mutate: deletePlanMutation } = useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setDeleteTargetId(null)
    },
  })

  const debouncedUpdate = useDebouncedCallback((id: number, completed: boolean) => {
    updatePlanMutation({ id, data: { completed } })
  }, 300)

  const handlePlanClick = (id: number, completed: boolean) => {
    queryClient.setQueryData(['plans', selectedDate], (old: Plan[]) =>
      old?.map((p) => (p.id === id ? { ...p, completed } : p))
    )
    debouncedUpdate(id, completed)
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-2">
      <div className="flex items-center gap-x-2">
        <h2 className="text-lg font-semibold">계획</h2>
        <PlanFormDialog mode="add">
          <Button variant="default" size="icon-xs">
            <PlusIcon />
          </Button>
        </PlanFormDialog>
      </div>

      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-8 w-full" />)
      ) : !plans || plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <FileIcon className="w-4 h-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm mt-1">No Data</p>
        </div>
      ) : (
        plans?.map((plan) => {
          const dDay = dayjs(plan.endTimestamp)
            .startOf('day')
            .diff(dayjs(selectedDate).startOf('day'), 'day')

          return (
            <div key={`plan-${plan.id}`} className="flex items-center gap-2 rounded-md py-1 px-2">
              <Checkbox
                id={plan.id.toString()}
                checked={plan.completed}
                onCheckedChange={() => handlePlanClick(plan.id, !plan.completed)}
              />
              <label
                htmlFor={plan.id.toString()}
                className={cn('text-sm', {
                  'text-muted-foreground line-through': plan.completed,
                  'text-foreground': !plan.completed,
                })}
              >
                {plan.title}
              </label>

              <div className="flex items-center gap-2 ml-auto">
                {dDay > 0 && (
                  <span className="text-muted-foreground text-sm truncate">D-{dDay}</span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <EllipsisIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditTargetPlan(plan)}>
                      <PencilIcon /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTargetId(plan.id)}
                    >
                      <TrashIcon /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })
      )}

      {/* Plan 삭제 AlertDialog */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTargetId && deletePlanMutation(deleteTargetId)}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Plan 수정 Dialog */}
      <PlanFormDialog
        mode="edit"
        plan={editTargetPlan ?? undefined}
        open={editTargetPlan !== null}
        onOpenChange={(open) => {
          if (!open) setEditTargetPlan(null)
        }}
      />
    </aside>
  )
}
