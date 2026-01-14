// Daily 페이지 타입 정의

export interface Todo {
  id: string
  title: string
  completed: boolean
  start_timestamp: string
}

export interface TimeBlock {
  id: string
  start_timestamp: string // ISO 8601 with timezone (예: "2024-01-11T04:00:00+09:00")
  end_timestamp: string // ISO 8601 with timezone
  title: string
  color?: string
}
