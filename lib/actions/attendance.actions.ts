'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AttendanceStatus } from "@prisma/client"
import { requireTeacher } from "@/lib/auth-helpers"

export async function getAttendance(classId: string, date: string) {
    const teacherId = await requireTeacher()

    const cls = await db.class.findFirst({
        where: { id: classId, teacherId },
        select: { id: true },
    })
    if (!cls) throw new Error("Class not found")

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
    const teacherId = await requireTeacher()

    if (!record || record.length === 0) {
        throw new Error("No attendance records provided")
    }

    const classId = record[0].classId
    if (!record.every(r => r.classId === classId)) {
        throw new Error("All attendance records must belong to the same class")
    }

    const cls = await db.class.findFirst({
        where: { id: classId, teacherId },
        select: { id: true },
    })
    if (!cls) throw new Error("Class not found")

    const studentIds = Array.from(new Set(record.map(r => r.studentId)))
    const studentsInClass = await db.student.findMany({
        where: { id: { in: studentIds }, classId },
        select: { id: true },
    })
    if (studentsInClass.length !== studentIds.length) {
        throw new Error("One or more students are not in this class")
    }

    const date = new Date(record[0].date)
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)

    await db.attendance.deleteMany({
        where: {
            classId,
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