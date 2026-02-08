export type Response<T> = {
  data?: T
  error?: string
}

// 분 단위 시간 (START_HOUR 기준, 0 = 04:00)
export type Minutes = number
