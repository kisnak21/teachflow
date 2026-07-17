-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "accessCode" SET DEFAULT substr(md5(random()::text), 1, 6);
