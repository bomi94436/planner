'use client'

import {
  Calendar as CalendarIcon,
  CalendarDays as CalendarDaysIcon,
  CalendarRange as CalendarRangeIcon,
  ChevronsUpDown,
  FolderIcon,
  HomeIcon,
  ListCheckIcon,
  LogOutIcon,
  SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Calendar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { useIsMobile } from '@/hooks'
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
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const selectedDate = useDateStore((state) => state.selectedDate)
  const setSelectedDate = useDateStore((state) => state.setSelectedDate)
  const { data: session } = useSession()
  const user = {
    name: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    avatar: session?.user?.image ?? '',
  }

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
        <Separator />
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                  <LogOutIcon />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
