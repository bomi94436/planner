import { api } from '@/api'
import type { CategoriesResponse } from '@/types/category'
import {
  CreateExecutionBody,
  ExecutionResponse,
  ExecutionsResponse,
  GetExecutionsQuery,
  UpdateExecutionBody,
} from '@/types/execution'
import { CreateTaskBody, TaskResponse, UpdateTaskBody } from '@/types/task'

export const getCategories = async () => {
  const response = await api.get<CategoriesResponse>('/api/categories')
  return response.data?.data
}

export const createTask = async (data: CreateTaskBody) => {
  const response = await api.post<TaskResponse>('/api/tasks', data)
  return response.data?.data
}

export const updateTask = async (id: number, data: UpdateTaskBody) => {
  const response = await api.patch<TaskResponse>(`/api/tasks/${id}`, data)
  return response.data?.data
}

export const deleteTask = async (id: number) => {
  const response = await api.delete<TaskResponse>(`/api/tasks/${id}`)
  return response.data?.data
}

export const getExecutions = async ({ startTimestamp, endTimestamp }: GetExecutionsQuery) => {
  const response = await api.get<ExecutionsResponse>('/api/executions', {
    params: {
      startTimestamp,
      endTimestamp,
    },
  })
  return response.data?.data
}

export const createExecution = async (data: CreateExecutionBody) => {
  const response = await api.post<ExecutionResponse>('/api/executions', data)
  return response.data?.data
}

export const updateExecution = async (id: number, data: UpdateExecutionBody) => {
  const response = await api.patch<ExecutionResponse>(`/api/executions/${id}`, data)
  return response.data?.data
}

export const deleteExecution = async (id: number) => {
  const response = await api.delete<ExecutionResponse>(`/api/executions/${id}`)
  return response.data?.data
}
