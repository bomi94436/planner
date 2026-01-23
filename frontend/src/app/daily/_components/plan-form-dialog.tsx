'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { ChevronDownIcon, ChevronRightIcon, Clock9Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import type { Plan } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { UpdatePlanBody } from '@/types/plan'

import { createPlan, updatePlan } from '../_api/func'

type DialogMode = 'add' | 'edit'

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
  const isOpen = open !== undefined ? open : internalOpen

  // 폼 상태
  const [title, setTitle] = useState('')
  const [startTimestamp, setStartTimestamp] = useState('')
  const [endTimestamp, setEndTimestamp] = useState('')
  const [isAllDay, setIsAllDay] = useState(true)
  const [editDateMode, setEditDateMode] = useState<'start' | 'end' | null>(null)
  const [isOpenDatePicker, setIsOpenDatePicker] = useState(false)

  // Dialog가 열릴 때 폼 초기화
  useEffect(() => {
    if (!isOpen) return

    if (mode === 'edit' && plan) {
      setTitle(plan.title)
      setStartTimestamp(dayjs(plan.startTimestamp).format('YYYY-MM-DDTHH:mm'))
      setEndTimestamp(dayjs(plan.endTimestamp).format('YYYY-MM-DDTHH:mm'))
      setIsAllDay(plan.isAllDay)
    } else {
      setTitle('')
      setStartTimestamp(dayjs(selectedDate).format('YYYY-MM-DDTHH:mm'))
      setEndTimestamp(dayjs(selectedDate).format('YYYY-MM-DDTHH:mm'))
      setIsAllDay(true)
    }
    setEditDateMode(null)
    setIsOpenDatePicker(false)
  }, [isOpen, mode, plan, selectedDate])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const planData = {
      title: title.trim(),
      startTimestamp: dayjs(startTimestamp).toISOString(),
      endTimestamp: dayjs(endTimestamp).toISOString(),
      isAllDay,
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              계획 제목
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="계획을 입력하세요"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-x-2">
            <Clock9Icon className="h-4 w-4" />

            {isAllDay ? (
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditDateMode((prev) => (prev === 'start' ? null : 'start'))}
                  className={cn({ 'opacity-50': editDateMode === 'end' })}
                >
                  {dayjs(startTimestamp).format('M월 D일')}
                </Button>
                <ChevronRightIcon className="h-4 w-4" />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditDateMode((prev) => (prev === 'end' ? null : 'end'))}
                  className={cn({ 'opacity-50': editDateMode === 'start' })}
                >
                  {dayjs(endTimestamp).format('M월 D일')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditDateMode((prev) => (prev === 'start' ? null : 'start'))}
                  className={cn({ 'opacity-50': editDateMode === 'end' })}
                >
                  <div className="flex flex-col justify-center">
                    <span>{dayjs(startTimestamp).format('M월 D일')}</span>
                    <span>{dayjs(startTimestamp).format('hh:mm A')}</span>
                  </div>
                </Button>
                <ChevronRightIcon className="h-4 w-4" />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditDateMode((prev) => (prev === 'end' ? null : 'end'))}
                  className={cn({ 'opacity-50': editDateMode === 'start' })}
                >
                  <div className="flex flex-col justify-center">
                    <span>{dayjs(endTimestamp).format('M월 D일')}</span>
                    <span>{dayjs(endTimestamp).format('hh:mm A')}</span>
                  </div>
                </Button>
              </div>
            )}

            <Button
              type="button"
              size="sm"
              variant={isAllDay ? 'default' : 'outline'}
              onClick={() => setIsAllDay(!isAllDay)}
              className="ml-auto"
            >
              하루종일
            </Button>
          </div>

          {editDateMode !== null && (
            <div className="ml-6 flex items-center gap-x-2">
              <Popover open={isOpenDatePicker} onOpenChange={setIsOpenDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    id="date-picker"
                    className="w-1/2 justify-between font-normal"
                  >
                    {dayjs(editDateMode === 'start' ? startTimestamp : endTimestamp).format(
                      'M월 D일'
                    )}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dayjs(
                      editDateMode === 'start' ? startTimestamp : endTimestamp
                    ).toDate()}
                    captionLayout="dropdown"
                    disabled={
                      editDateMode === 'start'
                        ? { after: dayjs(endTimestamp).toDate() }
                        : { before: dayjs(startTimestamp).toDate() }
                    }
                    onSelect={(date) => {
                      if (date) {
                        if (editDateMode === 'start') {
                          setStartTimestamp(dayjs(date).format('YYYY-MM-DDTHH:mm'))
                        } else {
                          setEndTimestamp(dayjs(date).format('YYYY-MM-DDTHH:mm'))
                        }
                      }
                      setIsOpenDatePicker(false)
                    }}
                  />
                </PopoverContent>
              </Popover>

              {!isAllDay && (
                <Input
                  type="time"
                  id="time-picker"
                  step="1"
                  value={
                    editDateMode === 'start'
                      ? dayjs(startTimestamp).format('HH:mm')
                      : dayjs(endTimestamp).format('HH:mm')
                  }
                  onChange={(e) => {
                    if (editDateMode === 'start') {
                      setStartTimestamp(dayjs(e.target.value).format('YYYY-MM-DDTHH:mm'))
                    } else {
                      setEndTimestamp(dayjs(e.target.value).format('YYYY-MM-DDTHH:mm'))
                    }
                  }}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-1/2 h-[38px]"
                />
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending || !title.trim()}>
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
