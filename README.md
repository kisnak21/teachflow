# TeachFlow

A full-stack SaaS application for teachers to manage classes, students, attendance, assignments, and lesson plans — with AI-powered lesson plan generation and a student portal.

## Tech Stack

- **Framework** — Next.js 16 (App Router) + TypeScript
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Database** — PostgreSQL (Neon) + Prisma 7
- **Auth** — Auth.js v5 (multi-role: teacher + student)
- **Email** — Resend (password reset)
- **AI** — Groq API (GPT OSS 120B)
- **File Storage** — Uploadthing
- **Deployment** — Vercel

## Features

### Teacher Portal

- Class management with level grouping, level filter, and class roster PDF export
- Student management with class filter and bulk Excel import
- Daily attendance recording with bulk select and PDF export
- Assignment management — assign to multiple classes, due date tracking, file attachments
- Lesson plan management with expandable detail view and file attachments
- AI lesson generator — grade-calibrated, regenerate button, save directly to lesson plans
- Analytics — attendance trend, breakdown chart, students per class
- Dark mode with indigo accent color

### Student Portal

- Login with student number + class access code (no email needed)
- Personal dashboard — attendance rate, upcoming assignments
- Full attendance history with status breakdown
- Class assignments view with attachment downloads

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Groq API key — free tier at [console.groq.com](https://console.groq.com)
- Uploadthing account — free tier at [uploadthing.com](https://uploadthing.com)
- Resend account — free tier at [resend.com](https://resend.com) (password reset emails)

### Setup

```bash
git clone https://github.com/yourusername/teachflow.git
cd teachflow
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-auth-secret"
GROQ_API_KEY="your-groq-api-key"
UPLOADTHING_TOKEN="your-uploadthing-token"
RESEND_API_KEY="your-resend-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# RESEND_FROM_EMAIL="TeachFlow <no-reply@yourdomain.com>"
```

If `RESEND_API_KEY` is unset, the app runs in dev mode and prints the password
reset link to the server console instead of sending an email.

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Optional — seed demo data (teacher, classes, students, attendance):

```bash
npm run db:seed
# Teacher login: teacher@teachflow.app / password123
# Class access codes are printed in the seed output
```

## Deployment

Vercel — add `DATABASE_URL`, `AUTH_SECRET`, `GROQ_API_KEY`, `UPLOADTHING_TOKEN`,
`RESEND_API_KEY`, and `NEXT_PUBLIC_APP_URL` as environment variables. Build script
handles `prisma generate` automatically.

## Known Limitations

- Profile name changes require re-login to reflect in the UI (JWT cache limitation)
- Student submissions and grade tracking deferred (student accounts are read-only)
- PDF/Excel export for grades deferred (no grading system yet)
