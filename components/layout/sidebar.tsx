'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	LayoutDashboard,
	Users,
	BookOpen,
	ClipboardList,
	CalendarCheck,
	FileText,
	Settings,
	GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
	{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/classes', label: 'Classes', icon: BookOpen },
	{ href: '/students', label: 'Students', icon: Users },
	{ href: '/attendance', label: 'Attendance', icon: CalendarCheck },
	{ href: '/assignments', label: 'Assignments', icon: ClipboardList },
	{ href: '/lesson-plans', label: 'Lesson Plans', icon: FileText },
]

export function Sidebar() {
	const pathname = usePathname()

	return (
		<aside className='fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background flex flex-col'>
			{/* Logo */}
			<div className='flex items-center gap-2 px-6 py-5 border-b'>
				<GraduationCap className='h-6 w-6 text-primary' />
				<span className='font-semibold text-lg tracking-tight'>TeachFlow</span>
			</div>

			{/* Nav */}
			<nav className='flex-1 px-3 py-4 space-y-1'>
				{navItems.map((item) => {
					const Icon = item.icon
					const isActive =
						pathname === item.href || pathname.startsWith(item.href + '/')

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
								isActive
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground',
							)}
						>
							<Icon className='h-4 w-4 shrink-0' />
							{item.label}
						</Link>
					)
				})}
			</nav>

			{/* Bottom */}
			<div className='px-3 py-4 border-t'>
				<Link
					href='/settings'
					className={cn(
						'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
						pathname === '/settings'
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground',
					)}
				>
					<Settings className='h-4 w-4 shrink-0' />
					Settings
				</Link>
			</div>
		</aside>
	)
}
