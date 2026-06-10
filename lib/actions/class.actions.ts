'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getClasses() {
	const session = await auth()
	if (!session?.user?.id) throw new Error('Unauthorized')

	return db.class.findMany({
		where: { teacherId: session.user.id },
		include: { _count: { select: { students: true } } },
		orderBy: { createdAt: 'desc' },
	})
}

export async function createClass(name: string) {
	const session = await auth()
	if (!session?.user?.id) throw new Error('Unauthorized')

	if (!name.trim()) throw new Error('Class name is required')

	await db.class.create({
		data: {
			name: name.trim(),
			teacherId: session.user.id,
		},
	})

	revalidatePath('/classes')
}

export async function updateClass(id: string, name: string) {
	const session = await auth()
	if (!session?.user?.id) throw new Error('Unauthorized')

	if (!name.trim()) throw new Error('Class name is required')

	await db.class.update({
		where: { id, teacherId: session.user.id },
		data: { name: name.trim() },
	})

	revalidatePath('/classes')
}

export async function deleteClass(id: string) {
	const session = await auth()
	if (!session?.user?.id) throw new Error('Unauthorized')

	await db.class.delete({
		where: { id, teacherId: session.user.id },
	})

	revalidatePath('/classes')
}
