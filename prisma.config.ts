import path from "path"
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})