"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function getAttendanceTrend() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const records = await db.attendance.findMany({
    where: {
      class: { teacherId: session.user.id },
      date: { gte: thirtyDaysAgo },
    },
    select: { date: true, status: true },
    orderBy: { date: "asc" },
  })

  type AttendanceCounts = { present: number; absent: number; late: number }
  const grouped = new Map<string, AttendanceCounts>()

  for (const record of records) {
    const dateKey = record.date.toISOString().split("T")[0]
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, { present: 0, absent: 0, late: 0 })
    }
    const entry = grouped.get(dateKey)!
    if (record.status === "PRESENT") entry.present++
    if (record.status === "ABSENT") entry.absent++
    if (record.status === "LATE") entry.late++
  }

  return Array.from(grouped.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }))
}

export async function getStudentsPerClass() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const classes = await db.class.findMany({
    where: { teacherId: session.user.id },
    select: {
      name: true,
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  })

  return classes.map((c) => ({
    name: c.name,
    students: c._count.students,
  }))
}

export async function getOverallAttendanceRate() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const records = await db.attendance.groupBy({
    by: ["status"],
    where: { class: { teacherId: session.user.id } },
    _count: { status: true },
  })

  const total = records.reduce((sum, r) => sum + r._count.status, 0)

  return records.map((r) => ({
    name: r.status,
    value: r._count.status,
    percentage: total > 0 ? Math.round((r._count.status / total) * 100) : 0,
  }))
}