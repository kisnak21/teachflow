import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@/auth"

const f = createUploadthing()

export const ourFileRouter = {
  attachmentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user?.id) throw new UploadThingError("Unauthorized")

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter