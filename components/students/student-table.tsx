'use client'

import { useState } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteStudent } from '@/lib/actions/student.actions'
import { EditStudentDialog } from './edit-student-dialog'

interface Student {
	id: string
	name: string
	studentNumber: string
	classId: string
	class: { id: string; name: string }
}

interface Props {
	students: Student[]
	classes: { id: string; name: string }[]
}

export function StudentTable({ students, classes }: Props) {
	const [editStudent, setEditStudent] = useState<Student | null>(null)

	async function handleDelete(id: string, name: string) {
		if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
		await deleteStudent(id)
	}

	return (
		<>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Student Number</TableHead>
							<TableHead>Class</TableHead>
							<TableHead className='w-[80px]'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{students.map((student) => (
							<TableRow key={student.id}>
								<TableCell className='font-medium'>{student.name}</TableCell>
								<TableCell>{student.studentNumber}</TableCell>
								<TableCell>{student.class.name}</TableCell>
								<TableCell>
									<div className='flex items-center gap-1'>
										<Button
											variant='ghost'
											size='icon'
											className='h-8 w-8'
											onClick={() => setEditStudent(student)}
										>
											<Pencil className='h-4 w-4' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='h-8 w-8 text-destructive hover:text-destructive'
											onClick={() => handleDelete(student.id, student.name)}
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{editStudent && (
				<EditStudentDialog
					student={editStudent}
					classes={classes}
					open={!!editStudent}
					onOpenChange={(open) => !open && setEditStudent(null)}
				/>
			)}
		</>
	)
}
