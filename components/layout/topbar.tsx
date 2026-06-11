import { auth } from '@/auth'
import { signOut } from '@/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export async function Topbar({ title }: { title: string }) {
	const session = await auth()
	const user = session?.user
	const initials = user?.name
		? user.name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
		: 'U'

	return (
		<header className='h-14 border-b bg-background flex items-center justify-between px-6'>
			<h1 className='text-sm font-semibold text-foreground'>{title}</h1>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						className='relative h-8 w-8 rounded-full'
					>
						<Avatar className='h-8 w-8'>
							<AvatarFallback className='text-xs'>{initials}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className='w-56'
					align='end'
					forceMount
				>
					<DropdownMenuLabel className='font-normal'>
						<div className='flex flex-col space-y-1'>
							<p className='text-sm font-medium'>{user?.name}</p>
							<p className='text-xs text-muted-foreground'>{user?.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<form
							action={async () => {
								'use server'
								await signOut({ redirectTo: '/login' })
							}}
						>
							<button className='w-full text-left text-sm cursor-pointer'>
								Sign out
							</button>
						</form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	)
}
