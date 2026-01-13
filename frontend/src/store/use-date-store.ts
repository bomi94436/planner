import { create } from 'zustand'

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
