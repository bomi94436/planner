import dayjs from 'dayjs'
import { ClockIcon } from 'lucide-react'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui'

interface PlanTimeInputProps {
  value: Date
  onChange: (date: Date) => void
}

export const PlanTimeInput: React.FC<PlanTimeInputProps> = ({ value, onChange }) => {
  return (
    <InputGroup className="h-[38px]">
      <InputGroupInput
        type="time"
        id="time-picker"
        step="1"
        value={dayjs(value).format('HH:mm')}
        onChange={(e) => {
          const [hours, minutes] = e.target.value.split(':').map(Number)
          const newDate = dayjs(value).hour(hours).minute(minutes).toDate()
          onChange(newDate)
        }}
        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-1/2"
      />
      <InputGroupAddon>
        <ClockIcon className="size-4 text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  )
}
