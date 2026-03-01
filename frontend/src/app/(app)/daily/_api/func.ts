import axios from 'axios'

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
  const response = await axios.get<CategoriesResponse>('/api/categories')
  return response.data?.data
}

export const createTask = async (data: CreateTaskBody) => {
  const response = await axios.post<TaskResponse>('/api/tasks', data)
  return response.data?.data
}

export const updateTask = async (id: number, data: UpdateTaskBody) => {
  const response = await axios.patch<TaskResponse>(`/api/tasks/${id}`, data)
  return response.data?.data
}

export const deleteTask = async (id: number) => {
  const response = await axios.delete<TaskResponse>(`/api/tasks/${id}`)
  return response.data?.data
}

export const getExecutions = async ({ startTimestamp, endTimestamp }: GetExecutionsQuery) => {
  const response = await axios.get<ExecutionsResponse>('/api/executions', {
    params: {
      startTimestamp,
      endTimestamp,
    },
  })
  return response.data?.data
}

export const createExecution = async (data: CreateExecutionBody) => {
  const response = await axios.post<ExecutionResponse>('/api/executions', data)
  return response.data?.data
}

export const updateExecution = async (id: number, data: UpdateExecutionBody) => {
  const response = await axios.patch<ExecutionResponse>(`/api/executions/${id}`, data)
  return response.data?.data
}

export const deleteExecution = async (id: number) => {
  const response = await axios.delete<ExecutionResponse>(`/api/executions/${id}`)
  return response.data?.data
}
