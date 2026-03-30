import dayjs from 'dayjs'
import { useEffect } from 'react'

import { useDateStore } from '@/store'
import { getCurrentPlannerDate } from '@/utils'

export function useAutoDateAdvance() {
  const selectedDate = useDateStore((state) => state.selectedDate)
  const setSelectedDate = useDateStore((state) => state.setSelectedDate)

  useEffect(() => {
    const interval = setInterval(() => {
      const today = dayjs(getCurrentPlannerDate())
      const yesterday = today.subtract(1, 'day')
      if (dayjs(selectedDate).isSame(yesterday, 'day')) {
        setSelectedDate(today.toDate())
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [selectedDate, setSelectedDate])
}
