import axios from 'axios'

import type { CategoriesResponse } from '@/types/category'
import {
  CreatePlanBody,
  DeletePlanResponse,
  GetPlansQuery,
  PlanResponse,
  PlansResponse,
  UpdatePlanBody,
} from '@/types/plan'

export const getCategories = async () => {
  const response = await axios.get<CategoriesResponse>('/api/categories')
  return response.data?.data
}

export const getPlans = async ({ startTimestamp, endTimestamp }: GetPlansQuery) => {
  const response = await axios.get<PlansResponse>('/api/plans', {
    params: {
      startTimestamp,
      endTimestamp,
    },
  })
  return response.data?.data
}

export const createPlan = async (data: CreatePlanBody) => {
  const response = await axios.post<PlanResponse>('/api/plans', data)
  return response.data?.data
}

export const updatePlan = async (id: number, data: UpdatePlanBody) => {
  const response = await axios.patch<PlanResponse>(`/api/plans/${id}`, data)
  return response.data?.data
}

export const deletePlan = async (id: number) => {
  const response = await axios.delete<DeletePlanResponse>(`/api/plans/${id}`)
  return response.data?.data
}
