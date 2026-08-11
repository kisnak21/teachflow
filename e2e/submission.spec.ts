import 'dotenv/config'
import { test, expect } from '@playwright/test'
import { Client } from 'pg'

test.describe.configure({ mode: 'serial' })

const TEACHER = {
  email: 'teacher@teachflow.app',
  password: 'password123',
}

async function loginTeacher(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(TEACHER.email)
  await page.getByLabel('Password', { exact: true }).fill(TEACHER.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

async function loginStudent(
  page: import('@playwright/test').Page,
  studentNumber = '20241001'
) {
  await page.goto('/student/login')
  await page.getByLabel('Student Number').fill(studentNumber)
  await page.getByLabel('Class Code').fill('MATH10')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/student\/dashboard/)
}

interface SeedInfo {
  assignmentId: string
  assignmentTitle: string
  studentId: string
}

async function getSeedTarget(offset = 0): Promise<SeedInfo> {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const assignment = await client.query(
    `SELECT a.id, a.title FROM "Assignment" a
     JOIN "AssignmentClass" ac ON ac."assignmentId" = a.id
     JOIN "Class" c ON c.id = ac."classId"
     WHERE c."accessCode" = 'MATH10'
     ORDER BY a."dueDate" ASC
     LIMIT 1 OFFSET $1`,
    [offset]
  )
  const student = await client.query(
    `SELECT s.id FROM "Student" s
     JOIN "Class" c ON c.id = s."classId"
     WHERE c."accessCode" = 'MATH10' AND s."studentNumber" = '20241001'`
  )
  await client.end()

  if (assignment.rows.length === 0 || student.rows.length === 0) {
    throw new Error('Seed data not found — run `npm run db:seed` first')
  }

  return {
    assignmentId: assignment.rows[0].id,
    assignmentTitle: assignment.rows[0].title,
    studentId: student.rows[0].id,
  }
}

test('teacher grades a submission and the student sees the score', async ({
  page: teacherPage,
  browser,
}) => {
  const target = await getSeedTarget(0)

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  await client.query(
    `DELETE FROM "Submission" WHERE "id" = 'e2e-seeded-submission'`
  )
  await client.query(
    `INSERT INTO "Submission" ("id", "studentId", "assignmentId", "fileUrl", "fileName", "submittedAt")
     VALUES ('e2e-seeded-submission', $1, $2, 'https://example.com/tugas.pdf', 'tugas.pdf', NOW())`,
    [target.studentId, target.assignmentId]
  )
  await client.end()

  await loginTeacher(teacherPage)
  await teacherPage.goto('/assignments')

  const assignmentRow = teacherPage
    .getByRole('row')
    .filter({ hasText: target.assignmentTitle })
    .first()
  await assignmentRow.getByTitle('Submissions').click()

  await expect(
    teacherPage.getByRole('heading', { name: /Submissions/ })
  ).toBeVisible()

  const studentRow = teacherPage
    .getByRole('row')
    .filter({ hasText: 'Siswa X No 1' })
  await expect(studentRow.getByText('Submitted')).toBeVisible()

  await studentRow.getByTitle('Grade').click()
  await teacherPage.getByLabel('Score (0–100)').fill('85')
  await teacherPage.getByLabel('Feedback').fill('Good work, keep it up!')
  await teacherPage.getByRole('button', { name: 'Save grade' }).click()

  await expect(studentRow.getByText('Graded')).toBeVisible()
  await expect(studentRow.getByText('85')).toBeVisible()

  const studentPage = await browser.newPage()
  await loginStudent(studentPage)
  await studentPage.goto('/student/assignments')

  const myRow = studentPage
    .getByRole('row')
    .filter({ hasText: target.assignmentTitle })
    .first()
  await expect(myRow.getByText('Graded')).toBeVisible()
  await myRow.getByTitle('View submission').click()

  await expect(studentPage.getByText('Good work, keep it up!')).toBeVisible()
  await expect(studentPage.getByText('/ 100')).toBeVisible()

  await studentPage.close()
})

const canUpload =
  process.env.UPLOADTHING_TOKEN && process.env.UPLOADTHING_TOKEN !== 'dummy'

test('student submits work, teacher grades it, student sees the score', async ({
  browser,
}) => {
  test.skip(!canUpload, 'UPLOADTHING_TOKEN is not configured for real uploads')

  const target = await getSeedTarget(1)

  const studentPage = await browser.newPage()
  await loginStudent(studentPage)
  await studentPage.goto('/student/assignments')

  const myRow = studentPage
    .getByRole('row')
    .filter({ hasText: target.assignmentTitle })
    .first()
  await expect(myRow.getByText('Not submitted')).toBeVisible()
  await myRow.getByTitle('Submit work').click()

  await studentPage.setInputFiles('input[type="file"]', {
    name: 'tugas-e2e.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 e2e submission'),
  })
  await studentPage.getByLabel('Note (optional)').fill('e2e upload test')
  await studentPage.getByRole('button', { name: 'Submit' }).click()

  await expect(myRow.getByText('Submitted')).toBeVisible()

  const teacherPage = await browser.newPage()
  await loginTeacher(teacherPage)
  await teacherPage.goto('/assignments')

  const assignmentRow = teacherPage
    .getByRole('row')
    .filter({ hasText: target.assignmentTitle })
    .first()
  await assignmentRow.getByTitle('Submissions').click()

  const studentRow = teacherPage
    .getByRole('row')
    .filter({ hasText: 'Siswa X No 1' })
  await expect(studentRow.getByText('Submitted')).toBeVisible()
  await studentRow.getByTitle('Grade').click()
  await teacherPage.getByLabel('Score (0–100)').fill('90')
  await teacherPage.getByRole('button', { name: 'Save grade' }).click()
  await expect(studentRow.getByText('Graded')).toBeVisible()

  await teacherPage.close()

  await studentPage.reload()
  const updatedRow = studentPage
    .getByRole('row')
    .filter({ hasText: target.assignmentTitle })
    .first()
  await expect(updatedRow.getByText('Graded')).toBeVisible()
  await updatedRow.getByTitle('View submission').click()
  await expect(studentPage.getByText('90')).toBeVisible()

  studentPage.on('dialog', (dialog) => dialog.accept())
  await studentPage.getByRole('button', { name: 'Delete' }).click()
  await expect(updatedRow.getByText('Not submitted')).toBeVisible()

  await studentPage.close()
})
