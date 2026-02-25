'use client'

import 'dayjs/locale/ko'

import dayjs from 'dayjs'

import { useDateStore } from '@/store'

import { Button, SidebarTrigger } from '../ui'

export const AppHeader: React.FC = () => {
  const selectedDate = useDateStore((state) => state.selectedDate)
  const setSelectedDate = useDateStore((state) => state.setSelectedDate)
  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day')

  return (
    <header className="flex h-12 shrink-0 items-center border-b px-4">
      <SidebarTrigger />

      <div className="px-4 pt-2 pb-2 flex items-center justify-between gap-x-2">
        <p className="tracking-tight font-medium">
          {dayjs(selectedDate).locale('ko').format('M월 D일 dddd')}
        </p>

        <Button
          variant="secondary"
          size="sm"
          disabled={isToday}
          onClick={() => setSelectedDate(dayjs().toDate())}
        >
          오늘
        </Button>
      </div>
    </header>
  )
}
