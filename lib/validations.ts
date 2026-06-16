import { z } from "zod"

export const classSchema = z.object({
  name: z.string().min(1, "Class name is required").max(100),
  level: z.string().min(1, "Level is required").max(100),
})

export const studentSchema = z.object({
  name: z.string().min(1, "Student name is required").max(100),
  studentNumber: z.string().min(1, "Student number is required").max(50),
  classId: z.string().min(1, "Class is required"),
})

export const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  classIds: z.array(z.string()).min(1, "At least one class is required"),
})

export const lessonPlanSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().min(1, "Subject is required").max(100),
  objectives: z.string().max(2000).optional(),
  activities: z.string().max(2000).optional(),
  assessment: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  classId: z.string().min(1, "Class is required"),
})

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type ClassInput = z.infer<typeof classSchema>
export type StudentInput = z.infer<typeof studentSchema>
export type AssignmentInput = z.infer<typeof assignmentSchema>
export type LessonPlanInput = z.infer<typeof lessonPlanSchema>
export type RegisterInput = z.infer<typeof registerSchema>