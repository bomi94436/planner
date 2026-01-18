'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { getTodos } from '@/app/daily/_api/func'
import { Card, CardContent, Checkbox } from '@/components/ui'
import { useDateStore } from '@/store'
import { UpdateTodoBody } from '@/types/todo'

import { updateTodo } from '../_api/func'

export function TodoList() {
  const { selectedDate } = useDateStore()
  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: () =>
      getTodos({
        startTimestamp: dayjs(selectedDate).startOf('day').toISOString(),
        endTimestamp: dayjs(selectedDate).endOf('day').toISOString(),
      }),
  })
  const queryClient = useQueryClient()
  const { mutate: updateTodoMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoBody }) => updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <Card className="h-full py-4">
      <CardContent className="space-y-2">
        {todos?.map((todo) => (
          <div key={todo.id} className="flex items-center gap-3">
            <Checkbox
              id={todo.id}
              checked={todo.completed}
              onCheckedChange={() => {
                updateTodoMutation({
                  id: todo.id,
                  data: { completed: !todo.completed },
                })
              }}
            />
            <label
              htmlFor={todo.id}
              className={todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}
            >
              {todo.title}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
