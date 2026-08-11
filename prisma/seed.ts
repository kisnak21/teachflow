import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}
const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('password123', 12)

  const teacher = await db.user.upsert({
    where: { email: 'teacher@teachflow.app' },
    update: {},
    create: {
      name: 'Demo Teacher',
      email: 'teacher@teachflow.app',
      password,
    },
  })

  // Reset previous seed data (FK order matters)
  await db.assignmentClass.deleteMany()
  await db.attendance.deleteMany()
  await db.attachment.deleteMany()
  await db.assignment.deleteMany()
  await db.lessonPlan.deleteMany()
  await db.student.deleteMany()
  await db.class.deleteMany({ where: { teacherId: teacher.id } })

  const classDefs = [
    { name: 'Matematika', level: 'X', accessCode: 'MATH10', students: 8 },
    {
      name: 'Bahasa Indonesia',
      level: 'XI',
      accessCode: 'BIXI11',
      students: 8,
    },
    {
      name: 'Informatika',
      level: 'XI RPL',
      accessCode: 'INFXI12',
      students: 8,
    },
  ]

  const now = new Date()
  const classes: {
    id: string
    name: string
    level: string | null
    accessCode: string
  }[] = []

  for (const [i, def] of classDefs.entries()) {
    const cls = await db.class.create({
      data: {
        name: def.name,
        level: def.level,
        accessCode: def.accessCode,
        teacherId: teacher.id,
        students: {
          create: Array.from({ length: def.students }, (_, j) => ({
            name: `Siswa ${def.level} No ${j + 1}`,
            studentNumber: `2024${i + 1}${String(j + 1).padStart(3, '0')}`,
          })),
        },
      },
      include: { students: true },
    })
    classes.push(cls)

    // Attendance for the last 5 weekdays
    for (let day = 1; day <= 5; day++) {
      const date = new Date(now)
      date.setDate(date.getDate() - day)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const statuses = [
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'PRESENT',
        'LATE',
        'LATE',
        'ABSENT',
      ]
      await db.attendance.createMany({
        data: cls.students.map((student, j) => ({
          studentId: student.id,
          classId: cls.id,
          date,
          status: statuses[j % statuses.length] as
            | 'PRESENT'
            | 'LATE'
            | 'ABSENT',
        })),
      })
    }
  }

  await db.assignment.createMany({
    data: [
      {
        title: 'Latihan Persamaan Linear',
        description:
          'Kerjakan 10 soal persamaan linear di buku paket halaman 42.',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        teacherId: teacher.id,
      },
      {
        title: 'Tugas Menulis Karangan',
        description: 'Tulis karangan tentang lingkungan sekolah.',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        teacherId: teacher.id,
      },
    ],
  })

  const seedAssignments = await db.assignment.findMany({
    where: { teacherId: teacher.id },
    orderBy: { dueDate: 'asc' },
    select: { id: true },
  })

  await db.assignmentClass.createMany({
    data: seedAssignments.map((a) => ({
      assignmentId: a.id,
      classId: classes[0].id,
    })),
  })

  await db.lessonPlan.create({
    data: {
      title: 'Pengenalan Pemrograman Web',
      subject: 'Informatika',
      objectives: 'Siswa dapat menjelaskan struktur dasar HTML',
      activities: 'Praktik membuat halaman HTML sederhana',
      assessment: 'Kuis singkat 10 pertanyaan',
      classId: classes[2].id,
      teacherId: teacher.id,
    },
  })

  console.log('Seed complete:')
  console.log(`  Teacher login: teacher@teachflow.app / password123`)
  for (const cls of classes) {
    console.log(
      `  Class "${cls.name}" (${cls.level}) — access code: ${cls.accessCode}`
    )
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
