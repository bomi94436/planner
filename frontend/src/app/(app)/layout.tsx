import { AppHeader, AppSidebar } from '@/components/layout'
import { ScrollArea, SidebarInset, SidebarProvider } from '@/components/ui'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex h-screen flex-col">
        <AppHeader />
        <ScrollArea className="min-h-0 flex-1">
          <main className="py-6 px-10">{children}</main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}
