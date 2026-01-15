import dayjs from 'dayjs'

import type { Todo } from '@/types/daily'

// 초기 mock 데이터 (서버 시작 시 로드)
const initialTodos: Todo[] = [
  {
    id: '1',
    title: '아침 운동하기',
    completed: true,
    startTimestamp: new Date().toISOString(),
  },
  {
    id: '2',
    title: '프로젝트 회의 준비',
    completed: false,
    startTimestamp: new Date().toISOString(),
  },
  {
    id: '3',
    title: '이메일 확인 및 답장',
    completed: false,
    startTimestamp: new Date().toISOString(),
  },
  {
    id: '4',
    title: '점심 약속',
    completed: false,
    startTimestamp: new Date().toISOString(),
  },
  {
    id: '5',
    title: '독서 30분',
    completed: false,
    startTimestamp: new Date().toISOString(),
  },
]

// 인메모리 저장소 클래스
class TodoStore {
  private todos: Map<string, Todo> = new Map()
  private nextId: number = 6

  constructor() {
    // 초기 데이터 로드
    initialTodos.forEach((todo) => {
      this.todos.set(todo.id, todo)
    })
  }

  // 전체 조회
  getAll(): Todo[] {
    return Array.from(this.todos.values())
  }

  // 날짜별 필터링 조회
  getByDate(date: string): Todo[] {
    return this.getAll().filter((todo) => {
      const todoDate = dayjs(todo.startTimestamp).format('YYYY-MM-DD')
      return todoDate === date
    })
  }

  // 단일 조회
  getById(id: string): Todo | undefined {
    return this.todos.get(id)
  }

  // 생성
  create(data: Omit<Todo, 'id'>): Todo {
    const id = String(this.nextId++)
    const newTodo: Todo = { id, ...data }
    this.todos.set(id, newTodo)
    return newTodo
  }

  // 수정
  update(id: string, data: Partial<Omit<Todo, 'id'>>): Todo | undefined {
    const existing = this.todos.get(id)
    if (!existing) return undefined

    const updated: Todo = { ...existing, ...data }
    this.todos.set(id, updated)
    return updated
  }

  // 삭제
  delete(id: string): boolean {
    return this.todos.delete(id)
  }
}

// 싱글톤 인스턴스 (서버 재시작 시 초기화됨)
export const todoStore = new TodoStore()
