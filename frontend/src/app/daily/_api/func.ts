import axios from 'axios'

import {
  CreatePlanBody,
  GetPlansQuery,
  PlanResponse,
  PlansResponse,
  UpdatePlanBody,
} from '@/types/plan'

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
  const response = await axios.delete<PlanResponse>(`/api/plans/${id}`)
  return response.data?.data
}
