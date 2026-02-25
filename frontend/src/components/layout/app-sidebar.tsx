'use client'

import {
  Calendar as CalendarIcon,
  CalendarDays as CalendarDaysIcon,
  CalendarRange as CalendarRangeIcon,
  FolderIcon,
  HomeIcon,
  ListCheckIcon,
  SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Calendar,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui'
import { useDateStore } from '@/store'

type MenuItem = { href: string; label: string; icon: React.ElementType }
type MenuGroup =
  | { type: 'item'; menu: MenuItem }
  | { type: 'group'; title: string; menus: MenuItem[] }

const SIDEBAR_MENUS: MenuGroup[] = [
  {
    type: 'item',
    menu: { href: '/', label: 'Dashboard', icon: HomeIcon },
  },
  {
    type: 'group',
    title: 'Manage',
    menus: [
      { href: '/projects', label: 'Project', icon: FolderIcon },
      { href: '/habits', label: 'Habit Tracker', icon: ListCheckIcon },
    ],
  },
  {
    type: 'group',
    title: 'Calendar',
    menus: [
      { href: '/monthly', label: 'Monthly', icon: CalendarDaysIcon },
      { href: '/weekly', label: 'Weekly', icon: CalendarRangeIcon },
      { href: '/daily', label: 'Daily', icon: CalendarIcon },
    ],
  },
  {
    type: 'item',
    menu: { href: '/settings', label: 'Settings', icon: SettingsIcon },
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const selectedDate = useDateStore((state) => state.selectedDate)
  const setSelectedDate = useDateStore((state) => state.setSelectedDate)

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3 h-12">
        <h1 className="text-lg font-bold">Planner</h1>
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_MENUS.map((entry) => {
          if (entry.type === 'item') {
            return (
              <SidebarGroup key={entry.menu.href}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === entry.menu.href}>
                        <Link href={entry.menu.href}>
                          <entry.menu.icon />
                          <span>{entry.menu.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          }

          return (
            <SidebarGroup key={entry.title}>
              <SidebarGroupLabel>{entry.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {entry.menus.map((menu) => (
                    <SidebarMenuItem key={menu.href}>
                      <SidebarMenuButton asChild isActive={pathname === menu.href}>
                        <Link href={menu.href}>
                          <menu.icon />
                          <span>{menu.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="px-0">
        <Separator />
        <div className="px-4 py-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full bg-sidebar-background"
            captionLayout="dropdown"
            required
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
