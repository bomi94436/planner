'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { ChevronDownIcon, ChevronRightIcon, Clock9Icon } from 'lucide-react'
import { useState } from 'react'

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
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'

import { createPlan } from '../_api/func'

interface AddPlanDialogProps {
  children: React.ReactNode
}

export function AddPlanDialog({ children }: AddPlanDialogProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const { selectedDate, setSelectedDate } = useDateStore()

  const [title, setTitle] = useState('')
  const [startTimestamp, setStartTimestamp] = useState(() =>
    dayjs(selectedDate).format('YYYY-MM-DDTHH:mm')
  )
  const [endTimestamp, setEndTimestamp] = useState(() =>
    dayjs(selectedDate).format('YYYY-MM-DDTHH:mm')
  )
  const [isAllDay, setIsAllDay] = useState(false)

  const [editDateMode, setEditDateMode] = useState<'start' | 'end' | null>(null)
  const [isOpenDatePicker, setIsOpenDatePicker] = useState(false)

  const queryClient = useQueryClient()

  const { mutate: createPlanMutation, isPending } = useMutation({
    mutationFn: createPlan,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setOpenDialog(false)
      setTitle('')
      setSelectedDate(dayjs(variables.startTimestamp).toDate())
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createPlanMutation({
      title: title.trim(),
      startTimestamp: dayjs(startTimestamp).toISOString(),
      endTimestamp: dayjs(endTimestamp).toISOString(),
      isAllDay,
    })
  }

  // selectedDate가 변경되면 timestamp 초기값 업데이트
  const handleOpenChange = (isOpen: boolean) => {
    setOpenDialog(isOpen)
    if (isOpen) {
      setStartTimestamp(dayjs(selectedDate).format('YYYY-MM-DDTHH:mm'))
      setEndTimestamp(dayjs(selectedDate).format('YYYY-MM-DDTHH:mm'))
      setIsAllDay(true)
      setEditDateMode(null)
      setIsOpenDatePicker(false)
      setTitle('')
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>계획 추가</DialogTitle>
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
              {isPending ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
