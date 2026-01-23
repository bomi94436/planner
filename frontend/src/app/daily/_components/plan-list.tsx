'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { FileIcon, PencilIcon, TrashIcon } from 'lucide-react'
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
  Card,
  CardContent,
  Checkbox,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Skeleton,
} from '@/components/ui'
import type { Plan } from '@/generated/prisma/client'
import { useDateStore } from '@/store'
import { UpdatePlanBody } from '@/types/plan'

import { deletePlan, getPlans, updatePlan } from '../_api/func'
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
    <>
      <Card className="h-full py-4">
        <CardContent className="space-y-2 h-full">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))
          ) : !plans || plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FileIcon className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground text-sm mt-1">No Data</p>
            </div>
          ) : (
            plans?.map((plan) => {
              const dDay = dayjs(plan.endTimestamp).diff(dayjs(selectedDate), 'day')
              return (
                <ContextMenu key={`plan-${plan.id}`}>
                  <ContextMenuTrigger asChild>
                    <div
                      className="flex items-center gap-3 hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground cursor-pointer rounded-md py-1 px-2"
                      onClick={() => handlePlanClick(plan.id, !plan.completed)}
                    >
                      <Checkbox
                        id={plan.id.toString()}
                        checked={plan.completed}
                        onCheckedChange={() => handlePlanClick(plan.id, !plan.completed)}
                      />
                      <label
                        htmlFor={plan.id.toString()}
                        className={
                          plan.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                        }
                      >
                        {plan.title}
                      </label>

                      {dDay > 0 && (
                        <span className="ml-auto text-muted-foreground text-sm">D-{dDay}</span>
                      )}
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => setEditTargetPlan(plan)}>
                      <PencilIcon /> Edit
                    </ContextMenuItem>
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTargetId(plan.id)}
                    >
                      <TrashIcon /> Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )
            })
          )}
        </CardContent>
      </Card>

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
        key={editTargetPlan?.id ?? 'new'}
        mode="edit"
        plan={editTargetPlan ?? undefined}
        open={editTargetPlan !== null}
        onOpenChange={(open) => {
          if (!open) setEditTargetPlan(null)
        }}
      />
    </>
  )
}
