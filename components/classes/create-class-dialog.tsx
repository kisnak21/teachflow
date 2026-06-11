'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { createClass } from '@/lib/actions/class.actions'

export function CreateClassDialog() {
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			await createClass(name)
			setName('')
			setOpen(false)
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button size='sm'>
					<Plus className='h-4 w-4 mr-2' />
					New Class
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Class</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className='space-y-4 mt-2'
				>
					<div className='space-y-2'>
						<Label htmlFor='name'>Class Name</Label>
						<Input
							id='name'
							placeholder='e.g. XI RPL A'
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					{error && <p className='text-sm text-destructive'>{error}</p>}
					<div className='flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={loading}
						>
							{loading ? 'Creating...' : 'Create'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
