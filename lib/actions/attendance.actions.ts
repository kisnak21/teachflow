'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AttendanceStatus } from "@prisma/client"

export async function getAttendance(classId: string, date: string) {
    const session = await auth()
    if (!session) {
        throw new Error("Unauthorized")
    }

    const targetDate = new Date(date)
    const nextDay = new Date(targetDate)
    nextDay.setDate(targetDate.getDate() + 1)

    return db.attendance.findMany({
        where: {
            classId,
            date: {
                gte: targetDate,
                lt: nextDay
            }
        },
        include: {
            student: true
        }
    })
}

export async function saveAttendance(
    record: {
        studentId: string,
        classId: string,
        date: string,
        status: AttendanceStatus
    }[]
) {
    const session = await auth()
    if (!session) {
        throw new Error("Unauthorized")
    }

    const date = new Date(record[0].date)
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)

    await db.attendance.deleteMany({
        where: {
            classId: record[0].classId,
            date: {
                gte: date,
                lt: nextDay
            }
        }
    })

    await db.attendance.createMany({
        data: record.map(r => ({
            studentId: r.studentId,
            classId: r.classId,
            date: new Date(r.date),
            status: r.status
        }))
    })

    revalidatePath('/attendance')
}