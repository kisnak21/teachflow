import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <div className="hidden lg:block">
          <Topbar title="TeachFlow" />
        </div>
        <div className="lg:hidden h-14" />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}