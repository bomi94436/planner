'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { getPlans } from '@/app/daily/_api/func'
import { Card, CardContent, Checkbox } from '@/components/ui'
import { useDateStore } from '@/store'
import { UpdatePlanBody } from '@/types/plan'

import { updatePlan } from '../_api/func'

export function PlanList() {
  const { selectedDate } = useDateStore()
  const { data: plans } = useQuery({
    queryKey: ['plans', selectedDate],
    queryFn: () =>
      getPlans({
        startTimestamp: dayjs(selectedDate).startOf('day').toISOString(),
        endTimestamp: dayjs(selectedDate).endOf('day').toISOString(),
      }),
  })
  const queryClient = useQueryClient()
  const { mutate: updatePlanMutation } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanBody }) => updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })

  return (
    <Card className="h-full py-4">
      <CardContent className="space-y-2">
        {plans?.map((plan) => {
          const dDay = dayjs(plan.endTimestamp).diff(dayjs(selectedDate), 'day')
          return (
            <div key={plan.id} className="flex items-center gap-3">
              <Checkbox
                id={plan.id.toString()}
                checked={plan.completed}
                onCheckedChange={() => {
                  updatePlanMutation({
                    id: plan.id,
                    data: { completed: !plan.completed },
                  })
                }}
              />
              <label
                htmlFor={plan.id.toString()}
                className={
                  plan.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                }
              >
                {plan.title}
              </label>

              {dDay > 0 && <span className="ml-auto text-muted-foreground text-sm">D-{dDay}</span>}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
