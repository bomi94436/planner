import dayjs from 'dayjs'
import { create } from 'zustand'

import { START_HOUR } from '@/constants'

interface DateStore {
  // 선택된 날짜 (기본값: 오늘)
  selectedDate: Date
  // 날짜 변경 함수
  setSelectedDate: (date: Date) => void
}

export const useDateStore = create<DateStore>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))

// 일간 범위: START_HOUR 기준 하루 시작/끝
export const selectDayRange = (state: DateStore) => {
  const dayStart = dayjs(state.selectedDate).hour(START_HOUR).minute(0).second(0).millisecond(0)
  return { selectedDate: state.selectedDate, dayStart, dayEnd: dayStart.add(1, 'day') }
}

// 주간 범위: 일요일 START_HOUR 기준 한 주 시작/끝
export const selectWeekRange = (state: DateStore) => {
  const weekStart = dayjs(state.selectedDate)
    .day(0)
    .hour(START_HOUR)
    .minute(0)
    .second(0)
    .millisecond(0)
  return { selectedDate: state.selectedDate, weekStart, weekEnd: weekStart.add(7, 'day') }
}
