import { Card, CardContent, Checkbox } from '@/components/ui'
import type { Todo } from '@/types/daily'

interface TodoListProps {
  todos: Todo[]
}

export function TodoList({ todos }: TodoListProps) {
  return (
    <Card className="h-full py-4">
      <CardContent className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center gap-3">
            <Checkbox id={todo.id} checked={todo.completed} />
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
