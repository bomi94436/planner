'use client'
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
import type { Task, UpdateTaskBody } from '@/types/task'
import { deleteTask, getTasks, updateTask } from '~/daily/_api/func'

import { TaskFormDialog } from './task-form-dialog'

export function TaskList() {
  const { selectedDate } = useDateStore()
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [editTargetTask, setEditTargetTask] = useState<Task | null>(null)

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', selectedDate],
    queryFn: () =>
      getTasks({
        startTimestamp: dayjs(selectedDate).startOf('day').toISOString(),
        endTimestamp: dayjs(selectedDate).endOf('day').toISOString(),
      }),
  })

  const queryClient = useQueryClient()

  const { mutate: updateTaskMutation } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskBody }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { mutate: deleteTaskMutation } = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setDeleteTargetId(null)
    },
  })

  const debouncedUpdate = useDebouncedCallback((id: number, completed: boolean) => {
    updateTaskMutation({ id, data: { completed } })
  }, 300)

  const handleTaskClick = (id: number, completed: boolean) => {
    queryClient.setQueryData(['tasks', selectedDate], (old: Task[]) =>
      old?.map((t) => (t.id === id ? { ...t, completed } : t))
    )
    debouncedUpdate(id, completed)
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-2">
      <div className="flex items-center gap-x-2">
        <h2 className="text-lg font-semibold">할일</h2>
        <TaskFormDialog mode="add">
          <Button variant="default" size="icon-xs">
            <PlusIcon />
          </Button>
        </TaskFormDialog>
      </div>

      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-8 w-full" />)
      ) : !tasks || tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <FileIcon className="w-4 h-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm mt-1">No Data</p>
        </div>
      ) : (
        tasks?.map((task) => {
          const dDay = dayjs(task.endTimestamp)
            .startOf('day')
            .diff(dayjs(selectedDate).startOf('day'), 'day')

          return (
            <div key={`task-${task.id}`} className="flex items-center gap-2 rounded-md py-1 px-2">
              <Checkbox
                id={task.id.toString()}
                checked={task.completed}
                onCheckedChange={() => handleTaskClick(task.id, !task.completed)}
              />
              <label
                htmlFor={task.id.toString()}
                className={cn('text-sm', {
                  'text-muted-foreground line-through': task.completed,
                  'text-foreground': !task.completed,
                })}
              >
                {task.title}
              </label>

              <div className="flex items-center gap-2 ml-auto">
                {dDay > 0 && (
                  <span className="text-muted-foreground text-sm truncate">D-{dDay}</span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <EllipsisIcon className="text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditTargetTask(task)}>
                      <PencilIcon /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTargetId(task.id)}
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

      {/* Task 삭제 AlertDialog */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTargetId && deleteTaskMutation(deleteTargetId)}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task 수정 Dialog */}
      <TaskFormDialog
        mode="edit"
        task={editTargetTask ?? undefined}
        open={editTargetTask !== null}
        onOpenChange={(open) => {
          if (!open) setEditTargetTask(null)
        }}
      />
    </aside>
  )
}
