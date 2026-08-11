-- Convert User.role from String to Role enum, keeping existing data
CREATE TYPE "Role" AS ENUM ('TEACHER', 'STUDENT');

ALTER TABLE "User" DROP COLUMN "role";

ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'TEACHER';

-- Attendance: prevent duplicate (student, class, day) rows
CREATE UNIQUE INDEX "Attendance_studentId_classId_date_key" ON "Attendance"("studentId", "classId", "date");

-- Access codes are now generated in the app (lib/access-code.ts)
ALTER TABLE "Class" ALTER COLUMN "accessCode" DROP DEFAULT;
