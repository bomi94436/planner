import dayjs from 'dayjs'
import { ChevronDownIcon } from 'lucide-react'

import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'

interface PlanDatePickerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  value: Date
  disabled: Parameters<typeof Calendar>['0']['disabled']
  onSelect: (date: Date | undefined) => void
}

export const PlanDatePicker: React.FC<PlanDatePickerProps> = ({
  isOpen,
  onOpenChange,
  value,
  disabled,
  onSelect,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id="date-picker"
          className="w-1/2 justify-between font-normal"
        >
          {dayjs(value).format('M월 D일')}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          disabled={disabled}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
