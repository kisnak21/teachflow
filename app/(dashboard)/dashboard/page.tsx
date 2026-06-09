import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, CalendarCheck, ClipboardList } from 'lucide-react'

const stats = [
	{
		title: 'Total Classes',
		value: '0',
		icon: BookOpen,
		description: 'Active classes',
	},
	{
		title: 'Total Students',
		value: '0',
		icon: Users,
		description: 'Enrolled students',
	},
	{
		title: "Today's Attendance",
		value: '0%',
		icon: CalendarCheck,
		description: 'Present today',
	},
	{
		title: 'Upcoming Assignments',
		value: '0',
		icon: ClipboardList,
		description: 'Due this week',
	},
]

export default function DashboardPage() {
	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-2xl font-semibold tracking-tight'>Dashboard</h2>
				<p className='text-sm text-muted-foreground mt-1'>
					Welcome back. Here&apos;s what&apos;s happening today.
				</p>
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{stats.map((stat) => {
					const Icon = stat.icon
					return (
						<Card key={stat.title}>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium text-muted-foreground'>
									{stat.title}
								</CardTitle>
								<Icon className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stat.value}</div>
								<p className='text-xs text-muted-foreground mt-1'>
									{stat.description}
								</p>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}
