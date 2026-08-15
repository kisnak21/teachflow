import { test, expect } from '@playwright/test'

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

async function loginStudent(page: import('@playwright/test').Page) {
  await page.goto('/student/login')
  await page.getByLabel('Student Number').fill('20241001')
  await page.getByLabel('Class Code').fill('MATH10')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/student\/dashboard/)
}

test('unauthenticated AI generate returns 401', async ({ request }) => {
  const res = await request.post('/api/ai/generate', {
    data: {
      subject: 'Matematika',
      topic: 'Aljabar',
      grade: 'X',
      duration: '90 Menit',
    },
  })
  expect(res.status()).toBe(401)
  const body = await res.json()
  expect(body.error).toMatch(/Unauthorized/i)
})

test('teacher invalid body returns 400', async ({ page }) => {
  await loginTeacher(page)
  // Missing topic, grade, duration
  const res = await page.request.post('/api/ai/generate', {
    data: {
      subject: 'Matematika',
      topic: '',
      grade: '',
      duration: '',
    },
  })
  expect(res.status()).toBe(400)
})

test('student cannot generate AI plan (403)', async ({ page }) => {
  await loginStudent(page)
  const res = await page.request.post('/api/ai/generate', {
    data: {
      subject: 'Matematika',
      topic: 'Aljabar',
      grade: 'X',
      duration: '90 Menit',
    },
  })
  expect(res.status()).toBe(403)
})

test('generate page requires login', async ({ page }) => {
  await page.goto('/lesson-plans/generate')
  // Should redirect to login (teacher auth)
  await expect(page).toHaveURL(/\/login/)
})

test('generate page shows form after teacher login', async ({ page }) => {
  await loginTeacher(page)
  await page.goto('/lesson-plans/generate')
  await expect(
    page.getByRole('heading', { name: /Detail Pelajaran/i })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Generate RPP/i })
  ).toBeVisible()
  // Model selector should be hidden (round-robin automatic)
  await expect(page.getByText('Model AI')).toHaveCount(0)
})
