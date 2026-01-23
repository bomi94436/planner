import dayjs from 'dayjs'

import { Input } from '@/components/ui'

interface PlanTimeInputProps {
  value: Date
  onChange: (date: Date) => void
}

export const PlanTimeInput: React.FC<PlanTimeInputProps> = ({ value, onChange }) => {
  return (
    <Input
      type="time"
      id="time-picker"
      step="1"
      value={dayjs(value).format('HH:mm')}
      onChange={(e) => {
        const [hours, minutes] = e.target.value.split(':').map(Number)
        const newDate = dayjs(value).hour(hours).minute(minutes).toDate()
        onChange(newDate)
      }}
      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-1/2 h-[38px]"
    />
  )
}
