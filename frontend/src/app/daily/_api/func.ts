import axios from 'axios'

import {
  CreateTodoBody,
  GetTodosQuery,
  TodoResponse,
  TodosResponse,
  UpdateTodoBody,
} from '@/types/todo'

export const getTodos = async ({ startTimestamp, endTimestamp }: GetTodosQuery) => {
  try {
    const response = await axios.get<TodosResponse>('/api/todos', {
      params: {
        startTimestamp,
        endTimestamp,
      },
    })
    return response.data?.data
  } catch (error) {
    throw error
  }
}

export const createTodo = async (data: CreateTodoBody) => {
  try {
    const response = await axios.post<TodoResponse>('/api/todos', data)
    return response.data?.data
  } catch (error) {
    throw error
  }
}

export const updateTodo = async (id: string, data: UpdateTodoBody) => {
  try {
    const response = await axios.patch<TodoResponse>(`/api/todos/${id}`, data)
    return response.data?.data
  } catch (error) {
    throw error
  }
}

export const deleteTodo = async (id: string) => {
  try {
    const response = await axios.delete<TodoResponse>(`/api/todos/${id}`)
    return response.data?.data
  } catch (error) {
    throw error
  }
}
