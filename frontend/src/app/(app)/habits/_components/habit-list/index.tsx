'use client'

import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import React from 'react'

import { Skeleton } from '@/components/ui'
import { useDateStore } from '@/store'
import { getHabits } from '~/habits/_api/func'

import { HabitCard } from './habit-card'

export const HabitList: React.FC = () => {
  const selectedDate = useDateStore((state) => state.selectedDate)
  const startDate = dayjs(selectedDate).startOf('month').format('YYYY-MM-DD')
  const endDate = dayjs(selectedDate).endOf('month').format('YYYY-MM-DD')

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits', startDate, endDate],
    queryFn: () => getHabits({ startDate, endDate }),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!habits || habits.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        등록된 습관이 없습니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  )
}
