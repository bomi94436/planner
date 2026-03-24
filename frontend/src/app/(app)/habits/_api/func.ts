import { api } from '@/api'
import type { CategoriesResponse } from '@/types/category'
import type {
  CreateHabitBody,
  DeleteHabitLogResponse,
  DeleteHabitResponse,
  HabitBaseResponse,
  HabitLogResponse,
  HabitsResponse,
  UpdateHabitBody,
  UpsertHabitLogBody,
} from '@/types/habit'

export const getCategories = async () => {
  const response = await api.get<CategoriesResponse>('/api/categories')
  return response.data?.data
}

export const getHabits = async (params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get<HabitsResponse>('/api/habits', { params })
  return response.data?.data
}

export const createHabit = async (data: CreateHabitBody) => {
  const response = await api.post<HabitBaseResponse>('/api/habits', data)
  return response.data?.data
}

export const updateHabit = async (id: number, data: UpdateHabitBody) => {
  const response = await api.patch<HabitBaseResponse>(`/api/habits/${id}`, data)
  return response.data?.data
}

export const deleteHabit = async (id: number) => {
  const response = await api.delete<DeleteHabitResponse>(`/api/habits/${id}`)
  return response.data?.data
}

export const upsertHabitLog = async (data: UpsertHabitLogBody) => {
  const response = await api.post<HabitLogResponse>('/api/habit-logs', data)
  return response.data?.data
}

export const deleteHabitLog = async (id: number) => {
  const response = await api.delete<DeleteHabitLogResponse>(`/api/habit-logs/${id}`)
  return response.data?.data
}
