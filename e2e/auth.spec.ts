import { test, expect } from '@playwright/test'

test('teacher can log in with seeded credentials', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('teacher@teachflow.app')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Welcome back')).toBeVisible()
})

test('student can log in with student number and class access code', async ({
  page,
}) => {
  await page.goto('/student/login')

  await page.getByLabel('Student Number').fill('20241001')
  await page.getByLabel('Class Code').fill('MATH10')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/student\/dashboard/)
  await expect(page.getByText('Welcome,')).toBeVisible()
})

test('student access code is case-insensitive', async ({ page }) => {
  await page.goto('/student/login')

  await page.getByLabel('Student Number').fill('20241002')
  await page.getByLabel('Class Code').fill('math10')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/student\/dashboard/)
})

test('wrong credentials show an error', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('teacher@teachflow.app')
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Invalid email or password')).toBeVisible()
})

test('teacher is redirected away from student portal', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('teacher@teachflow.app')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/dashboard/)

  await page.goto('/student/dashboard')
  await expect(page).toHaveURL(/\/dashboard/)
})

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
