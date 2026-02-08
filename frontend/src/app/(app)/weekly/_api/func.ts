import axios from 'axios'

import { CreatePlanBody, GetPlansQuery, PlanResponse, PlansResponse } from '@/types/plan'

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
