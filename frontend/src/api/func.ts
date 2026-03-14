import { api } from '@/api'
import { GetTasksQuery, TasksResponse } from '@/types/task'

export const getTasks = async ({ startTimestamp, endTimestamp }: GetTasksQuery) => {
  const response = await api.get<TasksResponse>('/api/tasks', {
    params: {
      startTimestamp,
      endTimestamp,
    },
  })
  return response.data?.data
}
