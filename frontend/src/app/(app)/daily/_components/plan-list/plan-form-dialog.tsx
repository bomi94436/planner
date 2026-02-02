'use client'

import { createPlan, updatePlan } from '@daily/_api/func'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
} from '@/components/ui'
import { useDateStore } from '@/store'
import type { Plan, UpdatePlanBody } from '@/types/plan'

type DialogMode = 'add' | 'edit'
type PlanFormData = Omit<Plan, 'id' | 'completed'>

interface PlanFormDialogProps {
  mode: DialogMode
  /** edit 모드에서 필수 - 수정할 Plan 데이터 */
  plan?: Plan
  /** Dialog open 상태 (controlled mode) */
  open?: boolean
  /** Dialog open 상태 변경 핸들러 (controlled mode) */
  onOpenChange?: (open: boolean) => void
  /** Trigger element (uncontrolled mode에서 사용) */
  children?: React.ReactNode
}

export function PlanFormDialog({ mode, plan, open, onOpenChange, children }: PlanFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { selectedDate, setSelectedDate } = useDateStore()
  const queryClient = useQueryClient()

  // controlled vs uncontrolled
  const isOpen = open ?? internalOpen

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isValid, isDirty },
  } = useForm<PlanFormData>({
    mode: 'onChange',
  })

  // dialog가 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && plan) {
      reset(plan)
    } else {
      reset({
        title: '',
        startTimestamp: selectedDate,
        endTimestamp: selectedDate,
        isAllDay: true,
      })
    }
  }, [isOpen, mode, plan, reset, selectedDate])

  // 폼 값 watch
  const { startTimestamp, endTimestamp, isAllDay } = watch()

  // 시작 시간 변경 핸들러
  const handleStartChange = (date: Date) => {
    setValue('startTimestamp', date, { shouldDirty: true })
  }

  // 종료 시간 변경 핸들러
  const handleEndChange = (date: Date) => {
    setValue('endTimestamp', date, { shouldDirty: true })
  }

  const { mutate: createPlanMutation, isPending: isCreating } = useMutation({
    mutationFn: createPlan,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      handleOpenChange(false)
      setSelectedDate(dayjs(variables.startTimestamp).toDate())
    },
  })

  const { mutate: updatePlanMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanBody }) => updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
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

  const onSubmit = (data: PlanFormData) => {
    const planData = {
      title: data.title.trim(),
      startTimestamp: dayjs(data.startTimestamp).toISOString(),
      endTimestamp: dayjs(data.endTimestamp).toISOString(),
      isAllDay: data.isAllDay,
    }

    if (mode === 'edit' && plan) {
      updatePlanMutation({ id: plan.id, data: planData })
    } else {
      createPlanMutation(planData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '계획 수정' : '계획 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 계획 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              계획 제목
            </label>
            <Input
              id="title"
              placeholder="계획을 입력하세요"
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
