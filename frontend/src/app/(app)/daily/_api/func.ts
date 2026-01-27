import axios from 'axios'

import {
  CreateExecutionBody,
  ExecutionResponse,
  ExecutionsResponse,
  GetExecutionsQuery,
  UpdateExecutionBody,
} from '@/types/execution'
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
