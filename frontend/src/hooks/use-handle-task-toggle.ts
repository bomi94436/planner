import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'

import type { Task, UpdateTaskBody } from '@/types/task'
import { updateTask } from '~/daily/_api/func'

/**
 * Task 체크박스 토글 핸들러
 * @returns {function} handleTaskToggle - Task 체크박스 토글 핸들러
 *
 * @example
 * const handleTaskToggle = useHandleTaskToggle()
 * <Checkbox onCheckedChange={handleTaskToggle(task.id, !task.completed)} />
 */
export function useHandleTaskToggle(): {
  handleTaskToggle: (id: number, completed: boolean) => () => void
} {
  const queryClient = useQueryClient()

  const { mutate: updateTaskMutation } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskBody }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const debouncedUpdate = useDebouncedCallback((id: number, completed: boolean) => {
    updateTaskMutation({ id, data: { completed } })
  }, 300)

  const handleTaskToggle = (id: number, completed: boolean) => () => {
    queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) =>
      old?.map((t) => (t.id === id ? { ...t, completed } : t))
    )
    debouncedUpdate(id, completed)
  }

  return {
    handleTaskToggle,
  }
}
