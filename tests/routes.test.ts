import { expect, test, describe } from 'vitest'
import {
  isTeacherAuthPage,
  isStudentAuthPage,
  isTeacherRoute,
  isStudentRoute,
} from '../lib/routes'

describe('Route helpers', () => {
  test('isTeacherAuthPage identifies correct paths', () => {
    expect(isTeacherAuthPage('/login')).toBe(true)
    expect(isTeacherAuthPage('/register')).toBe(true)
    expect(isTeacherAuthPage('/dashboard')).toBe(false)
    expect(isTeacherAuthPage('/student/login')).toBe(false)
  })

  test('isStudentAuthPage identifies correct paths', () => {
    expect(isStudentAuthPage('/student/login')).toBe(true)
    expect(isStudentAuthPage('/login')).toBe(false)
    expect(isStudentAuthPage('/student/dashboard')).toBe(false)
  })

  test('isTeacherRoute identifies correct paths', () => {
    expect(isTeacherRoute('/dashboard')).toBe(true)
    expect(isTeacherRoute('/attendance')).toBe(true)
    expect(isTeacherRoute('/classes/123')).toBe(true)
    expect(isTeacherRoute('/login')).toBe(false)
    expect(isTeacherRoute('/student/dashboard')).toBe(false)
  })

  test('isStudentRoute identifies correct paths', () => {
    expect(isStudentRoute('/student')).toBe(true)
    expect(isStudentRoute('/student/dashboard')).toBe(true)
    expect(isStudentRoute('/student/attendance')).toBe(true)
    expect(isStudentRoute('/student/login')).toBe(false)
    expect(isStudentRoute('/dashboard')).toBe(false)
  })
})
