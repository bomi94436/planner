import dayjs from 'dayjs'

import type { TimeBlock, Todo } from '@/types/daily'

// 샘플 TODO 데이터
export const mockTodos: Todo[] = [
  { id: '1', title: '아침 운동하기', completed: true, startTimestamp: dayjs().toISOString() },
  {
    id: '2',
    title: '프로젝트 회의 준비',
    completed: false,
    startTimestamp: dayjs().toISOString(),
  },
  {
    id: '3',
    title: '이메일 확인 및 답장',
    completed: false,
    startTimestamp: dayjs().toISOString(),
  },
  { id: '4', title: '점심 약속', completed: false, startTimestamp: dayjs().toISOString() },
  { id: '5', title: '독서 30분', completed: false, startTimestamp: dayjs().toISOString() },
]

// 샘플 타임블록 데이터 (오늘 날짜 기준)
const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

export const mockTimeBlocks: TimeBlock[] = [
  {
    id: '1',
    startTimestamp: `${today}T06:00:00+09:00`,
    endTimestamp: `${today}T07:00:00+09:00`,
    title: '아침 운동',
    color: '#22c55e', // green
  },
  {
    id: '2',
    startTimestamp: `${today}T09:00:00+09:00`,
    endTimestamp: `${today}T10:30:00+09:00`,
    title: '프로젝트 회의',
    color: '#3b82f6', // blue
  },
  {
    id: '3',
    startTimestamp: `${today}T12:00:00+09:00`,
    endTimestamp: `${today}T13:00:00+09:00`,
    title: '점심 식사',
    color: '#f59e0b', // amber
  },
  {
    id: '4',
    startTimestamp: `${today}T14:00:00+09:00`,
    endTimestamp: `${today}T17:00:00+09:00`,
    title: '집중 작업 시간',
    color: '#8b5cf6', // violet
  },
]
