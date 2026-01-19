import axios from 'axios'

import {
  CreatePlanBody,
  GetPlansQuery,
  PlanResponse,
  PlansResponse,
  UpdatePlanBody,
} from '@/types/plan'

export const getPlans = async ({ startTimestamp, endTimestamp }: GetPlansQuery) => {
  try {
    const response = await axios.get<PlansResponse>('/api/plans', {
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

export const createPlan = async (data: CreatePlanBody) => {
  try {
    const response = await axios.post<PlanResponse>('/api/plans', data)
    return response.data?.data
  } catch (error) {
    throw error
  }
}

export const updatePlan = async (id: string, data: UpdatePlanBody) => {
  try {
    const response = await axios.patch<PlanResponse>(`/api/plans/${id}`, data)
    return response.data?.data
  } catch (error) {
    throw error
  }
}

export const deletePlan = async (id: string) => {
  try {
    const response = await axios.delete<PlanResponse>(`/api/plans/${id}`)
    return response.data?.data
  } catch (error) {
    throw error
  }
}
