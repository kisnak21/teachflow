import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='min-h-screen bg-muted/30'>
			<Sidebar />
			<div className='ml-64 flex flex-col min-h-screen'>
				<Topbar title='Dashboard' />
				<main className='flex-1 p-6'>{children}</main>
			</div>
		</div>
	)
}
