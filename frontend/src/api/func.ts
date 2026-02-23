import axios from 'axios'

import { GetTasksQuery, TasksResponse } from '@/types/task'

export const getTasks = async ({ startTimestamp, endTimestamp }: GetTasksQuery) => {
  const response = await axios.get<TasksResponse>('/api/tasks', {
    params: {
      startTimestamp,
      endTimestamp,
    },
  })
  return response.data?.data
}
