'use client'

import dayjs from 'dayjs'
import {
  Calendar as CalendarIcon,
  CalendarDays as CalendarDaysIcon,
  CalendarRange as CalendarRangeIcon,
  Home,
  LayoutGrid,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Button,
  Calendar,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui'
import { useDateStore } from '@/store'
// 네비게이션 메뉴 항목
const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/yearly', label: 'Yearly', icon: LayoutGrid },
  { href: '/monthly', label: 'Monthly', icon: CalendarDaysIcon },
  { href: '/weekly', label: 'Weekly', icon: CalendarRangeIcon },
  { href: '/daily', label: 'Daily', icon: CalendarIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { selectedDate, setSelectedDate } = useDateStore()
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3 h-12">
        <h1 className="text-lg font-bold">Planner</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-2 pt-2 pb-2 flex items-center justify-between">
            <p className="text-2xl font-bold tracking-tight italic">
              {dayjs(selectedDate).format('MM. DD. ddd').toUpperCase()}
            </p>

            <Button
              variant="secondary"
              size="sm"
              disabled={dayjs(selectedDate).isSame(dayjs(), 'day')}
              onClick={() => setSelectedDate(dayjs().toDate())}
            >
              Today
            </Button>
          </div>

          <div className="px-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow-sm w-full"
              captionLayout="dropdown"
              required
            />
          </div>

          <SidebarGroupLabel className="mt-4">Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
