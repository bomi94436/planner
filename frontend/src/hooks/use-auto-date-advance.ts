import dayjs from 'dayjs'
import { useEffect } from 'react'

import { START_HOUR } from '@/constants'
import { useDateStore } from '@/store'

// START_HOUR 기준 현재 플래너 날짜 반환
// 04:00 이전이면 전날, 이후면 오늘
const getCurrentPlannerDate = (): dayjs.Dayjs => {
  const now = dayjs()
  return now.hour() < START_HOUR ? now.subtract(1, 'day').startOf('day') : now.startOf('day')
}

export function useAutoDateAdvance() {
  const selectedDate = useDateStore((state) => state.selectedDate)
  const setSelectedDate = useDateStore((state) => state.setSelectedDate)

  useEffect(() => {
    const interval = setInterval(() => {
      const today = getCurrentPlannerDate()
      const yesterday = today.subtract(1, 'day')
      if (dayjs(selectedDate).isSame(yesterday, 'day')) {
        setSelectedDate(today.toDate())
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [selectedDate, setSelectedDate])
}
