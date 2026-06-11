'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Pencil, Trash2 } from 'lucide-react'
import { deleteClass } from '@/lib/actions/class.actions'
import { EditClassDialog } from './edit-class-dialog'

interface ClassCardProps {
	cls: {
		id: string
		name: string
		_count: { students: number }
	}
}

export function ClassCard({ cls }: ClassCardProps) {
	const [deleting, setDeleting] = useState(false)
	const [editOpen, setEditOpen] = useState(false)

	async function handleDelete() {
		if (!confirm(`Delete "${cls.name}"? This cannot be undone.`)) return
		setDeleting(true)
		await deleteClass(cls.id)
	}

	return (
		<>
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-base'>{cls.name}</CardTitle>
				</CardHeader>
				<CardContent className='flex items-center justify-between'>
					<div className='flex items-center gap-1 text-sm text-muted-foreground'>
						<Users className='h-4 w-4' />
						<span>{cls._count.students} students</span>
					</div>
					<div className='flex items-center gap-1'>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8'
							onClick={() => setEditOpen(true)}
						>
							<Pencil className='h-4 w-4' />
						</Button>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8 text-destructive hover:text-destructive'
							onClick={handleDelete}
							disabled={deleting}
						>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</CardContent>
			</Card>

			<EditClassDialog
				cls={cls}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
		</>
	)
}
