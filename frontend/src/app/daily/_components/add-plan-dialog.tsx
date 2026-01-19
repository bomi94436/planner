'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'

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
import { useDateStore } from '@/store'

import { createPlan } from '../_api/func'

interface AddPlanDialogProps {
  children: React.ReactNode
}

export function AddPlanDialog({ children }: AddPlanDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const { selectedDate } = useDateStore()
  const [timestamp, setTimestamp] = useState(() => dayjs(selectedDate).format('YYYY-MM-DDTHH:mm'))

  const queryClient = useQueryClient()

  const { mutate: createPlanMutation, isPending } = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setOpen(false)
      setTitle('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createPlanMutation({
      title: title.trim(),
      startTimestamp: dayjs(timestamp).toISOString(),
    })
  }

  // selectedDate가 변경되면 timestamp 초기값 업데이트
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setTimestamp(dayjs(selectedDate).format('YYYY-MM-DDTHH:mm'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <div className="space-y-2">
            <label htmlFor="timestamp" className="text-sm font-medium">
              날짜 및 시간
            </label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
          </div>
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
