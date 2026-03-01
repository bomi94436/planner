'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Button,
  DateTimePicker,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useDateStore } from '@/store'
import type { Task, UpdateTaskBody } from '@/types/task'
import { createTask, getCategories, updateTask } from '~/daily/_api/func'

type DialogMode = 'add' | 'edit'

type TaskFormData = {
  title: string
  startTimestamp: Date
  endTimestamp: Date
  isAllDay: boolean
  categoryId: number | null
}

interface TaskFormDialogProps {
  mode: DialogMode
  /** edit 모드에서 필수 - 수정할 Task 데이터 */
  task?: Task
  /** Dialog open 상태 (controlled mode) */
  open?: boolean
  /** Dialog open 상태 변경 핸들러 (controlled mode) */
  onOpenChange?: (open: boolean) => void
  /** Trigger element (uncontrolled mode에서 사용) */
  children?: React.ReactNode
}

export function TaskFormDialog({ mode, task, open, onOpenChange, children }: TaskFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const selectedDate = useDateStore((state) => state.selectedDate)
  const setSelectedDate = useDateStore((state) => state.setSelectedDate)
  const queryClient = useQueryClient()

  // controlled vs uncontrolled
  const isOpen = open ?? internalOpen

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (data) => data ?? [],
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isValid, isDirty },
  } = useForm<TaskFormData>({
    mode: 'onChange',
  })

  // dialog가 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && task) {
      reset(task)
    } else {
      reset({
        title: '',
        startTimestamp: selectedDate,
        endTimestamp: selectedDate,
        isAllDay: true,
        categoryId: null,
      })
    }
  }, [isOpen, mode, task, reset, selectedDate])

  // 폼 값 watch
  const { startTimestamp, endTimestamp, isAllDay, categoryId } = watch()

  // 시작 시간 변경 핸들러
  const handleStartChange = (date: Date) => {
    setValue('startTimestamp', date, { shouldDirty: true })
  }

  // 종료 시간 변경 핸들러
  const handleEndChange = (date: Date) => {
    setValue('endTimestamp', date, { shouldDirty: true })
  }

  const { mutate: createTaskMutation, isPending: isCreating } = useMutation({
    mutationFn: createTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      handleOpenChange(false)
      setSelectedDate(dayjs(variables.startTimestamp).toDate())
    },
  })

  const { mutate: updateTaskMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskBody }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      handleOpenChange(false)
    },
  })

  const isPending = isCreating || isUpdating

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const onSubmit = (data: TaskFormData) => {
    const taskData = {
      title: data.title.trim(),
      startTimestamp: dayjs(data.startTimestamp).second(0).millisecond(0).toISOString(),
      endTimestamp: dayjs(data.endTimestamp).second(0).millisecond(0).toISOString(),
      isAllDay: data.isAllDay,
      categoryId: data.categoryId ?? null,
    }

    if (mode === 'edit' && task) {
      updateTaskMutation({ id: task.id, data: taskData })
    } else {
      createTaskMutation(taskData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '할일 수정' : '할일 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 할일 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              할일 제목
            </label>
            <Input
              id="title"
              placeholder="할일을 입력하세요"
              {...register('title', { required: true, validate: (v) => !!v.trim() })}
            />
          </div>

          <DateTimePicker
            startTimestamp={startTimestamp}
            endTimestamp={endTimestamp}
            isAllDay={isAllDay}
            onStartTimestampChange={handleStartChange}
            onEndTimestampChange={handleEndChange}
            onIsAllDayChange={() => setValue('isAllDay', !isAllDay, { shouldDirty: true })}
          />

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">카테고리</label>
            <Select
              value={String(categoryId ?? '')}
              onValueChange={(v) =>
                setValue('categoryId', v ? Number(v) : null, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 없음" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <span
                      className="size-2.5 rounded-full inline-block mr-1.5"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !isValid || !isDirty}>
              {isPending
                ? mode === 'edit'
                  ? '수정 중...'
                  : '추가 중...'
                : mode === 'edit'
                  ? '수정'
                  : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
