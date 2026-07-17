import { describe, it, expect } from 'vitest'
import {
  classSchema,
  studentSchema,
  assignmentSchema,
  lessonPlanSchema,
  registerSchema,
} from '@/lib/validations'

describe('classSchema', () => {
  it('accepts valid class data', () => {
    expect(classSchema.safeParse({ name: 'Math 101', level: 'X' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = classSchema.safeParse({ name: '', level: 'X' })
    expect(result.success).toBe(false)
  })

  it('rejects empty level', () => {
    const result = classSchema.safeParse({ name: 'Math', level: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name > 100 chars', () => {
    const result = classSchema.safeParse({ name: 'A'.repeat(101), level: 'X' })
    expect(result.success).toBe(false)
  })
})

describe('studentSchema', () => {
  it('accepts valid student data', () => {
    const result = studentSchema.safeParse({
      name: 'Budi',
      studentNumber: '2024001',
      classId: 'abc123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing studentNumber', () => {
    const result = studentSchema.safeParse({ name: 'Budi', classId: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      name: 'Teacher',
      email: 'teacher@school.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      name: 'Teacher',
      email: 'teacher@school.com',
      password: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Teacher',
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({
      name: '',
      email: 'a@b.com',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })
})

describe('assignmentSchema', () => {
  it('accepts valid assignment with classIds', () => {
    const result = assignmentSchema.safeParse({
      title: 'Homework 1',
      dueDate: '2026-08-01',
      classIds: ['class1', 'class2'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty classIds array', () => {
    const result = assignmentSchema.safeParse({
      title: 'Homework 1',
      dueDate: '2026-08-01',
      classIds: [],
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional description', () => {
    const result = assignmentSchema.safeParse({
      title: 'Homework 1',
      description: 'Do chapter 5',
      dueDate: '2026-08-01',
      classIds: ['c1'],
    })
    expect(result.success).toBe(true)
  })
})

describe('lessonPlanSchema', () => {
  it('accepts valid lesson plan', () => {
    const result = lessonPlanSchema.safeParse({
      title: 'Intro to Algebra',
      subject: 'Math',
      objectives: 'Learn basics',
      activities: 'Practice problems',
      classId: 'abc',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing subject', () => {
    const result = lessonPlanSchema.safeParse({
      title: 'Intro',
      objectives: 'x',
      activities: 'x',
      classId: 'abc',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields as undefined', () => {
    const result = lessonPlanSchema.safeParse({
      title: 'Intro',
      subject: 'Math',
      classId: 'abc',
    })
    expect(result.success).toBe(true)
  })
})
