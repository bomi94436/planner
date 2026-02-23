import { Calendar } from './_components/calendar'

export default function MonthlyPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-2">
      <h2 className="text-lg font-semibold">월간 할일</h2>
      <Calendar />
    </main>
  )
}
