// Daily 페이지 타입 정의

export interface Todo {
  id: string
  title: string
  completed: boolean
  startTimestamp: string
}

export interface TimeBlock {
  id: string
  startTimestamp: string // ISO 8601 with timezone (예: "2024-01-11T04:00:00+09:00")
  endTimestamp: string // ISO 8601 with timezone
  title: string
  color?: string
}
