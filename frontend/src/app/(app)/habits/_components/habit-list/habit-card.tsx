'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { MoreHorizontalIcon } from 'lucide-react'
import React, { useState } from 'react'

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
  Card,
  CardContent,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { useDateStore } from '@/store'
import type { Habit } from '@/types/habit'
import { cn } from '@/utils'
import { deleteHabit, deleteHabitLog, upsertHabitLog } from '~/habits/_api/func'

import { HabitFormDialog } from '../habit-form-dialog'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface HabitCardProps {
  habit: Habit
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [openDate, setOpenDate] = useState<string | null>(null)

  // 현재 달 캘린더 데이터
  const selectedDate = useDateStore((state) => state.selectedDate)
  const startOfMonth = dayjs(selectedDate).startOf('month')
  const daysInMonth = startOfMonth.daysInMonth()
  const firstDayOfWeek = startOfMonth.day() // 0=일, 6=토

  // 로그 맵 (날짜 → 로그 항목)
  const logMap = new Map(habit.logs.map((l) => [l.date, l]))

  // 날짜 셀 배열 (앞에 빈 셀 + 실제 날짜)
  const cells: Array<{ date: string | null; day: number | null }> = [
    ...Array.from({ length: firstDayOfWeek }, () => ({ date: null, day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const date = startOfMonth.date(day).format('YYYY-MM-DD')
      return { date, day }
    }),
  ]

  const { mutate: deleteHabitMutate } = useMutation({
    mutationFn: () => deleteHabit(habit.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })

  const { mutate: upsertLogMutate } = useMutation({
    mutationFn: upsertHabitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      setOpenDate(null)
    },
  })

  const { mutate: deleteLogMutate } = useMutation({
    mutationFn: deleteHabitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      setOpenDate(null)
    },
  })

  const handleLevelSelect = (date: string, level: 1 | 2 | 3) => {
    upsertLogMutate({ habitId: habit.id, date, completedLevel: level })
  }

  const handleLogDelete = (logId: number) => {
    deleteLogMutate(logId)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            {/* 습관 이름 및 카테고리 */}
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                {habit.category && (
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: habit.category.color }}
                  />
                )}
                <span className="font-semibold truncate">{habit.name}</span>
              </div>
              {habit.category && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {habit.category.name}
                </span>
              )}
            </div>

            {/* 더보기 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 shrink-0">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>수정</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 통계 row */}
          <div className="flex gap-4 text-sm text-muted-foreground pt-1">
            <span>현재 {habit.stats.currentStreak}일</span>
            <span>최대 {habit.stats.maxStreak}일</span>
            <span>누적 {habit.stats.totalDays}일</span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 캘린더 */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* 요일 헤더 */}
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {label}
              </div>
            ))}

            {/* 날짜 셀 */}
            {cells.map((cell, idx) => {
              if (!cell.date || !cell.day) {
                return <div key={`empty-${idx}`} />
              }

              const log = logMap.get(cell.date)
              const isDisabled =
                cell.date > dayjs().format('YYYY-MM-DD') || cell.date < dayjs().format('YYYY-MM-DD')

              if (isDisabled) {
                return (
                  <div
                    key={cell.date}
                    className={cn(
                      'flex aspect-square w-full items-center justify-center rounded text-xs font-medium bg-muted text-muted-foreground',
                      {
                        'opacity-50': dayjs().isBefore(cell.date),
                        'bg-green-100 text-green-700': log?.completedLevel === 1,
                        'bg-yellow-100 text-yellow-700': log?.completedLevel === 2,
                        'bg-red-100 text-red-700': log?.completedLevel === 3,
                      }
                    )}
                  >
                    {cell.day}
                  </div>
                )
              }

              return (
                <Popover
                  key={cell.date}
                  open={openDate === cell.date}
                  onOpenChange={(open) => setOpenDate(open ? cell.date : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        'flex aspect-square w-full items-center justify-center rounded text-xs font-medium transition-opacity hover:opacity-80 bg-muted text-muted-foreground cursor-pointer border',
                        {
                          'bg-green-100 text-green-700 border-green-700': log?.completedLevel === 1,
                          'bg-yellow-100 text-yellow-700 border-yellow-700':
                            log?.completedLevel === 2,
                          'bg-red-100 text-red-700 border-red-700': log?.completedLevel === 3,
                        }
                      )}
                    >
                      {cell.day}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 p-1" align="center">
                    <div className="flex flex-col">
                      <button
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                        onClick={() => handleLevelSelect(cell.date!, 1)}
                      >
                        🟢 {habit.levelEasy}
                      </button>
                      <button
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                        onClick={() => handleLevelSelect(cell.date!, 2)}
                      >
                        🟡 {habit.levelNormal}
                      </button>
                      <button
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                        onClick={() => handleLevelSelect(cell.date!, 3)}
                      >
                        🔴 {habit.levelChallenge}
                      </button>
                      {log && (
                        <button
                          className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                          onClick={() => handleLogDelete(log.id)}
                        >
                          ✕ 선택 제거
                        </button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 수정 다이얼로그 */}
      <HabitFormDialog
        mode="edit"
        habit={habit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>습관 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{habit.name}&quot; 습관을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteHabitMutate()}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
