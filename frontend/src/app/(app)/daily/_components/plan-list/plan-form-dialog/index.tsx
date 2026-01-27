'use client'

import { createPlan, updatePlan } from '@daily/_api/func'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Plan, UpdatePlanBody } from '@/types/plan'

import { PlanDatePicker } from './plan-date-picker'
import { PlanTimeInput } from './plan-time-input'

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
    formState: { isValid },
  } = useForm<PlanFormData>({
    defaultValues:
      mode === 'edit' && plan
        ? plan
        : {
            title: '',
            startTimestamp: selectedDate,
            endTimestamp: selectedDate,
            isAllDay: true,
          },
    mode: 'onChange',
  })

  // 폼 값 watch
  const { startTimestamp, endTimestamp, isAllDay } = watch()

  // UI 상태
  const [editDateMode, setEditDateMode] = useState<'start' | 'end' | null>(null)
  const [isOpenDatePicker, setIsOpenDatePicker] = useState(false)

  // 시작 시간 변경 핸들러
  const handleStartChange = (date: Date) => {
    setValue('startTimestamp', date)
    if (dayjs(date).isAfter(endTimestamp)) {
      setValue('endTimestamp', date)
    }
  }

  // 종료 시간 변경 핸들러
  const handleEndChange = (date: Date) => {
    setValue('endTimestamp', date)
    if (dayjs(date).isBefore(startTimestamp)) {
      setValue('startTimestamp', date)
    }
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
    setEditDateMode(null)
    setIsOpenDatePicker(false)

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
              autoFocus
            />
          </div>

          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              {/* 시작일시 */}
              <div className="flex flex-col">
                <label
                  htmlFor="start-date-time"
                  className={cn('text-sm font-medium mb-0.5', {
                    'opacity-50': editDateMode === 'end',
                  })}
                >
                  시작일시
                </label>
                <Button
                  id="start-date-time"
                  type="button"
                  variant="secondary"
                  onClick={() => setEditDateMode((prev) => (prev === 'start' ? null : 'start'))}
                  className={cn({ 'opacity-50': editDateMode === 'end' })}
                >
                  <div className="flex flex-col justify-center">
                    <span>{dayjs(startTimestamp).format('M월 D일')}</span>
                    {!isAllDay && <span>{dayjs(startTimestamp).format('hh:mm A')}</span>}
                  </div>
                </Button>
              </div>

              <ChevronRightIcon className="h-4 w-4" />

              {/* 종료일시 */}
              <div className="flex flex-col">
                <label
                  htmlFor="end-date-time"
                  className={cn('text-sm font-medium mb-0.5', {
                    'opacity-50': editDateMode === 'start',
                  })}
                >
                  종료일시
                </label>
                <Button
                  id="end-date-time"
                  type="button"
                  variant="secondary"
                  onClick={() => setEditDateMode((prev) => (prev === 'end' ? null : 'end'))}
                  className={cn({ 'opacity-50': editDateMode === 'start' })}
                >
                  <div className="flex flex-col justify-center">
                    <span>{dayjs(endTimestamp).format('M월 D일')}</span>
                    {!isAllDay && <span>{dayjs(endTimestamp).format('hh:mm A')}</span>}
                  </div>
                </Button>
              </div>
            </div>

            {/* 하루종일 버튼 */}
            <Button
              type="button"
              size="sm"
              variant={isAllDay ? 'default' : 'outline'}
              onClick={() => setValue('isAllDay', !isAllDay)}
              className="ml-auto"
            >
              하루종일
            </Button>
          </div>

          {/* 시작 날짜 및 시간 선택 */}
          {editDateMode === 'start' && (
            <div className="ml-6 flex items-center gap-x-2">
              <PlanDatePicker
                isOpen={isOpenDatePicker}
                onOpenChange={setIsOpenDatePicker}
                value={startTimestamp}
                disabled={{ after: endTimestamp }}
                onSelect={(date) => {
                  if (date) handleStartChange(date)
                  setIsOpenDatePicker(false)
                }}
              />
              {!isAllDay && <PlanTimeInput value={startTimestamp} onChange={handleStartChange} />}
            </div>
          )}

          {/* 종료 날짜 및 시간 선택 */}
          {editDateMode === 'end' && (
            <div className="ml-6 flex items-center gap-x-2">
              <PlanDatePicker
                isOpen={isOpenDatePicker}
                onOpenChange={setIsOpenDatePicker}
                value={endTimestamp}
                disabled={{ before: startTimestamp }}
                onSelect={(date) => {
                  if (date) handleEndChange(date)
                  setIsOpenDatePicker(false)
                }}
              />
              {!isAllDay && <PlanTimeInput value={endTimestamp} onChange={handleEndChange} />}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending || !isValid}>
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
