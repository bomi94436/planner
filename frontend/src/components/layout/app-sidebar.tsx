'use client'

import { Calendar, CalendarDays, CalendarRange, Home, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
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

// 네비게이션 메뉴 항목
const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/yearly', label: 'Yearly', icon: LayoutGrid },
  { href: '/monthly', label: 'Monthly', icon: CalendarDays },
  { href: '/weekly', label: 'Weekly', icon: CalendarRange },
  { href: '/daily', label: 'Daily', icon: Calendar },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3 h-12">
        <h1 className="text-lg font-bold">Planner</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
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
