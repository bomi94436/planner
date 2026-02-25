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
import type { Execution, UpdateExecutionBody } from '@/types/execution'
import { createExecution, updateExecution } from '~/daily/_api/func'
import { EXECUTION_COLOR_LIST } from '~/daily/_constants'

type DialogMode = 'add' | 'edit'
type ExecutionFormData = Omit<Execution, 'id'>

interface ExecutionFormDialogProps {
  mode: DialogMode
  open: boolean
  execution?: Partial<Execution> | null
  onOpenChange: (open: boolean) => void
}

export function ExecutionFormDialog({
  mode,
  open,
  execution,
  onOpenChange,
}: ExecutionFormDialogProps) {
  const selectedDate = useDateStore((state) => state.selectedDate)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
    reset,
  } = useForm<ExecutionFormData>({
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
      ...(execution ?? {}),
    })
  }, [open, execution, reset, selectedDate])

  // 시작 시간 변경 핸들러
  const handleStartChange = (date: Date) => {
    setValue('startTimestamp', date, { shouldDirty: true })
  }

  // 종료 시간 변경 핸들러
  const handleEndChange = (date: Date) => {
    setValue('endTimestamp', date, { shouldDirty: true })
  }

  const { mutate: createExecutionMutation, isPending: isCreating } = useMutation({
    mutationFn: createExecution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] })
      onOpenChange(false)
    },
  })

  const { mutate: updateExecutionMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExecutionBody }) =>
      updateExecution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] })
      onOpenChange(false)
    },
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (data: ExecutionFormData) => {
    const executionData = {
      title: data.title.trim(),
      startTimestamp: dayjs(data.startTimestamp).second(0).millisecond(0).toISOString(),
      endTimestamp: dayjs(data.endTimestamp).second(0).millisecond(0).toISOString(),
      color: data.color,
    }

    if (mode === 'edit' && execution?.id) {
      updateExecutionMutation({ id: execution.id, data: executionData })
    } else {
      createExecutionMutation(executionData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '실행 블럭 수정' : '실행 블럭 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 실행 블럭 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              실행 블럭 제목
            </label>
            <Input
              id="title"
              {...register('title', { required: true, validate: (v) => !!v.trim() })}
              placeholder="무엇을 실행했는지 입력하세요."
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
              {EXECUTION_COLOR_LIST.map((c) => (
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
