import { auth } from "@/auth"

export interface TeacherSession {
  id: string
  role: "teacher"
}

export interface StudentSession {
  id: string
  classId: string
  role: "student"
}

export async function requireTeacher(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

export async function requireStudent(): Promise<StudentSession> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "student") {
    throw new Error("Unauthorized")
  }
  if (!session.user.classId) {
    throw new Error("Student has no class")
  }
  return { id: session.user.id, classId: session.user.classId, role: "student" }
}

export async function getSession(): Promise<TeacherSession | StudentSession> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role === "student") {
    return {
      id: session.user.id,
      classId: session.user.classId ?? "",
      role: "student",
    }
  }
  return { id: session.user.id, role: "teacher" }
}
