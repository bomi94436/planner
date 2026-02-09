import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { CheckIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  Button,
  DateTimePicker,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Plan, UpdatePlanBody } from '@/types/plan'
import { createPlan, updatePlan } from '~/weekly/_api/func'
import { PLAN_COLOR_LIST } from '~/weekly/_constants'

type DialogMode = 'add' | 'edit'
type PlanFormData = Omit<Plan, 'id'>

interface PlanFormDialogProps {
  mode: DialogMode
  open: boolean
  plan?: Partial<Plan> | null
  onOpenChange: (open: boolean) => void
}

export function PlanFormDialog({ mode, open, plan, onOpenChange }: PlanFormDialogProps) {
  const { selectedDate } = useDateStore()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
    reset,
  } = useForm<PlanFormData>({
    mode: 'onChange',
  })

  const { startTimestamp, endTimestamp, color } = watch()

  useEffect(() => {
    if (!open) return
    reset({
      title: '',
      startTimestamp: selectedDate,
      endTimestamp: selectedDate,
      color: '#000000',
      ...(plan ?? {}),
    })
  }, [open, plan, reset, selectedDate])

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      onOpenChange(false)
    },
  })

  const { mutate: updatePlanMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanBody }) => updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      onOpenChange(false)
    },
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (data: PlanFormData) => {
    const planData = {
      title: data.title.trim(),
      startTimestamp: dayjs(data.startTimestamp).second(0).millisecond(0).toISOString(),
      endTimestamp: dayjs(data.endTimestamp).second(0).millisecond(0).toISOString(),
      color: data.color,
    }

    if (mode === 'edit' && plan?.id) {
      updatePlanMutation({ id: plan.id, data: planData })
    } else {
      createPlanMutation(planData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '계획 블럭 수정' : '계획 블럭 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 계획 블럭 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              계획 블럭 제목
            </label>
            <Input
              id="title"
              {...register('title', { required: true, validate: (v) => !!v.trim() })}
              placeholder="무엇을 계획했는지 입력하세요."
            />
          </div>

          <DateTimePicker
            startTimestamp={startTimestamp}
            endTimestamp={endTimestamp}
            isAllDay={false}
            onStartTimestampChange={handleStartChange}
            onEndTimestampChange={handleEndChange}
          />

          <div className="space-y-2">
            <label htmlFor="color" className="text-sm font-medium">
              색상
            </label>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
              {PLAN_COLOR_LIST.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="size-8 rounded-full flex items-center justify-center hover:shadow-md transition-all duration-300"
                  style={
                    {
                      backgroundColor: c,
                      '--tw-shadow-color': `${c}50`,
                    } as React.CSSProperties
                  }
                  onClick={() => setValue('color', c)}
                >
                  <CheckIcon
                    className={cn('size-6 text-white', {
                      'opacity-100 fade-in-0 duration-300': c === color,
                      'opacity-0 fade-out-0 duration-300': c !== color,
                    })}
                  />
                </button>
              ))}
            </div>
          </div>

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
