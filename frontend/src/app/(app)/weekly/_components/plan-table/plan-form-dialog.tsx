import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useDateStore } from '@/store'
import type { Plan, UpdatePlanBody } from '@/types/plan'
import { createPlan, getCategories, updatePlan } from '~/weekly/_api/func'

type DialogMode = 'add' | 'edit'

type PlanFormData = {
  title: string
  startTimestamp: Date
  endTimestamp: Date
  categoryId: number | null
}

interface PlanFormDialogProps {
  mode: DialogMode
  open: boolean
  plan?: Partial<Plan> | null
  onOpenChange: (open: boolean) => void
}

export function PlanFormDialog({ mode, open, plan, onOpenChange }: PlanFormDialogProps) {
  const selectedDate = useDateStore((state) => state.selectedDate)
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (data) => data ?? [],
  })

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

  const { startTimestamp, endTimestamp, categoryId } = watch()

  useEffect(() => {
    if (!open) return
    reset({
      title: '',
      startTimestamp: selectedDate,
      endTimestamp: selectedDate,
      categoryId: null,
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
      categoryId: data.categoryId ?? null,
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

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">카테고리</label>
            <Select
              value={String(categoryId ?? '')}
              onValueChange={(v) => setValue('categoryId', v ? Number(v) : null)}
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
